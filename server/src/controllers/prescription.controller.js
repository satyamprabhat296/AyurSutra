import Prescription from "../models/prescription.model.js";
import { dispensePrescriptionService } from "../services/prescription.service.js";
import Inventory from "../models/inventory.model.js";
import Medicine from "../models/medicine.model.js";


import { validatePrescription } from "../services/prescription.service.js";
import { generatePrescriptionPDF } from "../services/pdf.service.js";

// Create Prescription
export const createPrescription = async (req, res) => {

  try {

    const {
      patient,
      consultation,
      medicines,
      notes,
    } = req.body;

    await validatePrescription(
      consultation,
      medicines
    );

    const prescription = await Prescription.create({
      clinic: req.user.clinic,
      patient,
      consultation,
      prescribedBy: req.user._id,
      medicines,
      notes,
    });

    const result = await Prescription.findById(prescription._id)
      .populate("patient", "patientId fullName")
      .populate("consultation")
      .populate("prescribedBy", "name")
      .populate("medicines.medicine", "medicineName medicineCode");

    res.status(201).json({
      success: true,
      message: "Prescription created successfully.",
      prescription: result,
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }

};

// Get All Prescriptions
export const getPrescriptions = async (req, res) => {

  try {

    const prescriptions = await Prescription.find({
      clinic: req.user.clinic,
    })
      .populate("patient", "patientId fullName")
      .populate("prescribedBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: prescriptions.length,
      prescriptions,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// Get Single Prescription
export const getPrescription = async (req, res) => {

  try {

    const prescription = await Prescription.findById(req.params.id)
      .populate("patient")
      .populate("consultation")
      .populate("prescribedBy")
      .populate("medicines.medicine");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found.",
      });
    }

    res.status(200).json({
      success: true,
      prescription,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};
export const getPrescriptionPDF = async (req, res) => {
  try {

    const prescription = await Prescription.findOne({
      _id: req.params.id,
      clinic: req.user.clinic,
    })
      .populate("patient", "patientId fullName")
      .populate("consultation")
      .populate("prescribedBy", "name")
      .populate("dispensedBy", "name")
      .populate(
        "medicines.medicine",
        "medicineName medicineCode"
      );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found.",
      });
    }

    generatePrescriptionPDF(
      prescription,
      res
    );

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
// export const dispensePrescription = async (req, res) => {

//   try {

//     const prescription = await dispensePrescriptionService(
//       req.params.id,
//       req.user
//     );

//     res.status(200).json({
//       success: true,
//       message: "Prescription dispensed successfully.",
//       prescription,
//     });

//   } catch (error) {

//     res.status(400).json({
//       success: false,
//       message: error.message,
//     });

//   }

// };

export const dispensePrescription = async (req, res) => {
  try {
    const { medicineId, quantity } = req.body;

    if (!medicineId) {
      return res.status(400).json({
        success: false,
        message: "Medicine is required",
      });
    }

    const dispenseQuantity = Number(quantity);

    if (
      !Number.isInteger(dispenseQuantity) ||
      dispenseQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }

    const prescription =
      await Prescription.findOne({
        _id: req.params.id,
        clinic: req.user.clinic,
      });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    if (prescription.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cancelled prescription cannot be dispensed",
      });
    }

    const prescriptionMedicine =
      prescription.medicines.id(medicineId);

    if (!prescriptionMedicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found in prescription",
      });
    }

    const remainingQuantity =
      prescriptionMedicine.quantity -
      prescriptionMedicine.issuedQuantity;

    if (dispenseQuantity > remainingQuantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${remainingQuantity} units remaining to dispense`,
      });
    }

    const medicine =
      await Medicine.findOne({
        _id: prescriptionMedicine.medicine,
        clinic: req.user.clinic,
        isActive: true,
      });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    if (
      medicine.currentStock <
      dispenseQuantity
    ) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available stock: ${medicine.currentStock}`,
      });
    }

    // Reduce stock
    medicine.currentStock -= dispenseQuantity;

    await medicine.save();

    // Create inventory ISSUE transaction
    await Inventory.create({
      clinic: req.user.clinic,
      medicine: medicine._id,
      transactionType: "ISSUE",
      quantity: dispenseQuantity,
      remarks: `Issued against prescription ${prescription.prescriptionNumber}`,
      createdBy: req.user._id,
    });

    // Update prescription
    prescriptionMedicine.issuedQuantity +=
      dispenseQuantity;

    const allIssued =
      prescription.medicines.every(
        (item) =>
          item.issuedQuantity >= item.quantity
      );

    const someIssued =
      prescription.medicines.some(
        (item) =>
          item.issuedQuantity > 0
      );

    prescriptionMedicine.isIssued =
      prescriptionMedicine.issuedQuantity >=
      prescriptionMedicine.quantity;

    if (allIssued) {
      prescription.status = "ISSUED";
    } else if (someIssued) {
      prescription.status =
        "PARTIALLY_ISSUED";
    } else {
      prescription.status = "PENDING";
    }

    await prescription.save();

    res.status(200).json({
      success: true,
      message: "Medicine dispensed successfully",
      prescription,
      medicine,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};