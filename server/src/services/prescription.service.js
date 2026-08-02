import mongoose from "mongoose";
import Billing from "../models/billing.model.js";
import Prescription from "../models/prescription.model.js";
import Consultation from "../models/consultation.model.js";
import Medicine from "../models/medicine.model.js";
import Inventory from "../models/inventory.model.js";

export const validatePrescription = async (
  consultationId,
  medicines
) => {

  // One prescription per consultation
  const existing = await Prescription.findOne({
    consultation: consultationId,
  });

  if (existing) {
    throw new Error(
      "Prescription already exists for this consultation."
    );
  }

  // Consultation must exist
  const consultation = await Consultation.findById(
    consultationId
  );

  if (!consultation) {
    throw new Error("Consultation not found.");
  }

  // Check medicine existence
  for (const item of medicines) {

    const medicine = await Medicine.findById(item.medicine);

    if (!medicine) {
      throw new Error("Medicine not found.");
    }

  }

  return consultation;
};

export const dispensePrescriptionService = async (
  prescriptionId,
  user
) => {

  const session = await mongoose.startSession();

  try {

    session.startTransaction();

    // Fetch Prescription
    const prescription = await Prescription.findById(
      prescriptionId
    ).session(session);

    if (!prescription) {
      throw new Error("Prescription not found.");
    }

    // Prevent duplicate dispensing
    if (prescription.status === "DISPENSED") {
      throw new Error("Prescription already dispensed.");
    }

    // Process each medicine
    for (const item of prescription.medicines) {

      const medicine = await Medicine.findById(
        item.medicine
      ).session(session);

      if (!medicine) {
        throw new Error("Medicine not found.");
      }

      // Check stock
      if (medicine.currentStock < item.quantity) {
        throw new Error(
          `${medicine.medicineName} has insufficient stock.`
        );
      }

      // Deduct stock
      medicine.currentStock -= item.quantity;

      await medicine.save({ session });

      // Create inventory transaction
           await Inventory.create(
        [
          {
            clinic: prescription.clinic,
            medicine: medicine._id,
            transactionType: "ISSUE",
            quantity: item.quantity,
            remarks: "Prescription Dispensing",
            createdBy: user._id,
          },
        ],
        { session }
      );

    }

    // Find Bill
    const bill = await Billing.findOne({
      consultation: prescription.consultation,
    }).session(session);

    if (!bill) {
      throw new Error("Bill not found for this consultation.");
    }
    for (const item of prescription.medicines) {

  const medicine = await Medicine.findById(
    item.medicine
  ).session(session);

  const amount = medicine.sellingPrice * item.quantity;

  bill.items.push({
    name: medicine.medicineName,
    category: "MEDICINE",
    quantity: item.quantity,
    price: medicine.sellingPrice,
    amount,
  });

}
// Recalculate subtotal
bill.subtotal = bill.items.reduce(
  (sum, item) => sum + item.amount,
  0
);

// Recalculate total
bill.total =
  bill.subtotal - bill.discount + bill.tax;

// Save updated bill
await bill.save({ session });

    // Update prescription
    prescription.status = "DISPENSED";
    prescription.dispensedAt = new Date();
    prescription.dispensedBy = user._id;

    await prescription.save({ session });

    // Commit transaction
    await session.commitTransaction();

    // Return updated prescription
    const updatedPrescription = await Prescription.findById(
      prescription._id
    )
      .populate("patient")
      .populate("consultation")
      .populate("prescribedBy")
      .populate("dispensedBy")
      .populate("medicines.medicine");

    return updatedPrescription;

  } catch (error) {

    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;

  } finally {

    session.endSession();

  }

};