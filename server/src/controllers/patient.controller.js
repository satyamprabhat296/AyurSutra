import {
  generatePatientId,
  createPatient,
  getPatients,
  getPatientById,
  updatePatientById,
  deletePatientById,
} from "../services/patient.service.js";

/**
 * Register Patient
 */
export const registerPatient = async (req, res) => { 
  try {
    const patientId = await generatePatientId(); 

    const patient = await createPatient({
      ...req.body,
      clinic: req.user.clinic,
      patientId,
    });

    res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      patient,
    });
  } catch (error) {
    console.error("Register Patient Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get All Patients
 */
export const getAllPatients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
    } = req.query;

    const result = await getPatients({
      clinic: req.user.clinic,
      page: Number(page),
      limit: Number(limit),
      search,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get Patients Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Single Patient
 */
export const getPatient = async (req, res) => {
  try {
    const patient = await getPatientById(
      req.params.id,
      req.user.clinic
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.status(200).json({
      success: true,
      patient,
    });
  } catch (error) {
    console.error("Get Patient Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update Patient
 */
export const updatePatient = async (req, res) => {
  try {
    const patient = await updatePatientById(
      req.params.id,
      req.user.clinic,
      req.body
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      patient,
    });
  } catch (error) {
    console.error("Update Patient Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete Patient
 */
export const deletePatient = async (req, res) => {
  try {
    const patient = await deletePatientById(
      req.params.id,
      req.user.clinic
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
    });
  } catch (error) {
    console.error("Delete Patient Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};