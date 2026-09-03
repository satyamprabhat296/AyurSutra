import mongoose from "mongoose";
import Prescription from "../models/prescription.model.js";
import Inventory from "../models/inventory.model.js";
import Medicine from "../models/medicine.model.js";

export const issuePrescriptionMedicines = async (
  req,
  res
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { prescriptionId } = req.params;

    const prescription =
      await Prescription.findOne({
        _id: prescriptionId,
        clinic: req.user.clinic,
      }).session(session);

    if (!prescription) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    if (prescription.status === "CANCELLED") {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Cannot issue a cancelled prescription",
      });
    }

    if (prescription.status === "COMPLETED") {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message:
          "Prescription has already been issued",
      });
    }

    /*
     * First check ALL medicines.
     * Nothing is modified until every medicine
     * has sufficient stock.
     */
    const medicines = [];

    for (const item of prescription.items) {
      const medicine =
        await Medicine.findOne({
          _id: item.medicine,
          clinic: req.user.clinic,
          isActive: true,
        }).session(session);

      if (!medicine) {
        throw new Error(
          `Medicine "${item.medicineName}" not found`
        );
      }

      if (
        medicine.currentStock <
        item.quantity
      ) {
        throw new Error(
          `Insufficient stock for ${medicine.medicineName}. Available: ${medicine.currentStock}, Required: ${item.quantity}`
        );
      }

      medicines.push({
        medicine,
        item,
      });
    }

    const transactions = [];

    /*
     * Deduct stock + create inventory record
     */
    for (const {
      medicine,
      item,
    } of medicines) {
      medicine.currentStock -= item.quantity;

      await medicine.save({
        session,
      });

      const transaction =
        await Inventory.create(
          [
            {
              clinic: req.user.clinic,

              medicine: medicine._id,

              transactionType: "ISSUE",

              quantity: item.quantity,

              remarks:
                `Issued against prescription ${prescription.prescriptionNumber}`,

              createdBy: req.user._id,
            },
          ],
          { session }
        );

      transactions.push(transaction[0]);
    }

    /*
     * Mark prescription as completed
     */
    prescription.status = "COMPLETED";

    await prescription.save({
      session,
    });

    await session.commitTransaction();

    const updatedPrescription =
      await Prescription.findById(
        prescription._id
      )
        .populate("patient")
        .populate("doctor")
        .populate("appointment")
        .populate("consultation")
        .populate("items.medicine");

    res.status(200).json({
      success: true,
      message:
        "Medicines issued successfully",
      prescription: updatedPrescription,
      transactions,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error(
      "Issue prescription error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    await session.endSession();
  }
};