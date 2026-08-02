import Prescription from "../models/prescription.model.js";
import { dispensePrescriptionService } from "../services/prescription.service.js";


import { validatePrescription } from "../services/prescription.service.js";

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
export const dispensePrescription = async (req, res) => {

  try {

    const prescription = await dispensePrescriptionService(
      req.params.id,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Prescription dispensed successfully.",
      prescription,
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }

};