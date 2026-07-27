import Appointment from "../models/appointment.model.js";
import {
  generateAppointmentNumber,
  generateToken,
} from "../services/appointment.service.js";

export const createAppointment = async (req, res) => {
  try {
    const {
      patient,
      doctor,
      appointmentDate,
      appointmentTime,
      visitType,
      chiefComplaint,
      notes,
      followUpDate,
    } = req.body;

    const appointmentNumber = await generateAppointmentNumber();

    const tokenNumber = await generateToken(
      doctor,
      appointmentDate
    );

    const appointment = await Appointment.create({
      clinic: req.user.clinic,
      appointmentNumber,
      patient,
      doctor,
      appointmentDate,
      appointmentTime,
      tokenNumber,
      visitType,
      chiefComplaint,
      notes,
      followUpDate,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export const getAppointments = async (req, res) => {

  try {

    const appointments = await Appointment.find({
      clinic: req.user.clinic,
    })
      .populate("patient", "patientId fullName phone")
      .populate("doctor", "staffId name specialization")
      .sort({ appointmentDate: 1 });

    res.status(200).json({
      success: true,
      total: appointments.length,
      appointments,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export const getAppointment = async (req, res) => {

  try {

    const appointment = await Appointment.findById(req.params.id)
      .populate("patient")
      .populate("doctor");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      appointment,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export const updateAppointment = async (req, res) => {

  try {

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Appointment updated",
      appointment,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export const updateAppointmentStatus = async (req, res) => {

  try {

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.status = req.body.status;

    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Status updated",
      appointment,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export const cancelAppointment = async (req, res) => {

  try {

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.status = "CANCELLED";

    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment cancelled",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};