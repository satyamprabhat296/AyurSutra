import Consultation from "../models/consultation.model.js";
import Appointment from "../models/appointment.model.js";

/**
 * Create Consultation
 */
export const createConsultation = async (req, res) => {
  try {
    const {
      appointment,
      patient,
      doctor,
      vitals,
      chiefComplaint,
      diagnosis,
      prescription,
      therapies,
      advice,
      followUpDate,
    } = req.body;

    // -----------------------------------------
    // Validate appointment
    // -----------------------------------------

    const appointmentRecord = await Appointment.findOne({
      _id: appointment,
      clinic: req.user.clinic,
    });

    if (!appointmentRecord) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // -----------------------------------------
    // Prevent duplicate consultation
    // -----------------------------------------

    const existingConsultation =
      await Consultation.findOne({
        appointment,
        clinic: req.user.clinic,
      });

    if (existingConsultation) {
      return res.status(400).json({
        success: false,
        message:
          "A consultation already exists for this appointment",
        consultation: existingConsultation,
      });
    }

    // -----------------------------------------
    // Create consultation
    // -----------------------------------------

    const consultation =
      await Consultation.create({
        clinic: req.user.clinic,
        appointment,
        patient,
        doctor,
        vitals,
        chiefComplaint,
        diagnosis,
        prescription,
        therapies,
        advice,
        followUpDate,
        createdBy: req.user._id,
        status: "COMPLETED",
      });

    // -----------------------------------------
    // Update appointment status
    // -----------------------------------------

    appointmentRecord.status =
      "COMPLETED";

    await appointmentRecord.save();

    // -----------------------------------------
    // Return populated consultation
    // -----------------------------------------

    const result =
      await Consultation.findById(
        consultation._id
      )
        .populate(
          "patient",
          "patientId basicInfo contact"
        )
        .populate(
          "doctor",
          "staffId name specialization"
        )
        .populate(
          "appointment"
        )
        .populate(
          "createdBy",
          "name email"
        );

    res.status(201).json({
      success: true,
      message:
        "Consultation created successfully",
      consultation: result,
    });

  } catch (error) {

    console.error(
      "Create consultation error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * Get All Consultations
 */
export const getConsultations = async (
  req,
  res
) => {
  try {

    const consultations =
      await Consultation.find({
        clinic: req.user.clinic,
      })
        .populate(
          "patient",
          "patientId basicInfo contact"
        )
        .populate(
          "doctor",
          "staffId name specialization"
        )
        .populate(
          "appointment"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      total: consultations.length,
      consultations,
    });

  } catch (error) {

    console.error(
      "Get consultations error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * Get Single Consultation
 */
export const getConsultation = async (
  req,
  res
) => {
  try {

    const consultation =
      await Consultation.findOne({
        _id: req.params.id,
        clinic: req.user.clinic,
      })
        .populate(
          "patient"
        )
        .populate(
          "doctor"
        )
        .populate(
          "appointment"
        )
        .populate(
          "createdBy",
          "name email"
        );

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message:
          "Consultation not found",
      });
    }

    res.status(200).json({
      success: true,
      consultation,
    });

  } catch (error) {

    console.error(
      "Get consultation error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * Update Consultation
 */
export const updateConsultation = async (
  req,
  res
) => {
  try {

    const consultation =
      await Consultation.findOneAndUpdate(
        {
          _id: req.params.id,
          clinic: req.user.clinic,
        },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate("patient")
        .populate("doctor")
        .populate("appointment");

    if (!consultation) {
      return res.status(404).json({
        success: false,
        message:
          "Consultation not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Consultation updated successfully",
      consultation,
    });

  } catch (error) {

    console.error(
      "Update consultation error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}; 