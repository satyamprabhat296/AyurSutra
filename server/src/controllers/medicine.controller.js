import Medicine from "../models/medicine.model.js";
import { generateMedicineCode } from "../services/medicine.service.js";

// Create Medicine
export const createMedicine = async (req, res) => {
  try {
    const medicineCode = await generateMedicineCode();

    const medicine = await Medicine.create({
      ...req.body,
      clinic: req.user.clinic,
      medicineCode,
    });

    res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      medicine,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Get All Medicines
export const getMedicines = async (req, res) => {

  try {

    const medicines = await Medicine.find({
      clinic: req.user.clinic,
    }).sort({ medicineName: 1 });

    res.status(200).json({
      success: true,
      total: medicines.length,
      medicines,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// Get Single Medicine
export const getMedicine = async (req, res) => {

  try {

    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    res.status(200).json({
      success: true,
      medicine,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// Update Medicine
export const updateMedicine = async (req, res) => {

  try {

    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Medicine updated successfully",
      medicine,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// Delete Medicine
export const deleteMedicine = async (req, res) => {

  try {

    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    await medicine.deleteOne();

    res.status(200).json({
      success: true,
      message: "Medicine deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};