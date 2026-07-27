import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },

    appointmentNumber: {
      type: String,
      required: true,
      unique: true,
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },

    appointmentDate: {
      type: Date,
      required: true,
    },

    appointmentTime: {
      type: String,
      required: true,
    },

    tokenNumber: {
      type: Number,
      required: true,
    },

    visitType: {
      type: String,
      enum: [
        "NEW",
        "FOLLOW_UP",
      ],
      default: "NEW",
    },

    status: {
      type: String,
      enum: [
        "BOOKED",
        "CHECKED_IN",
        "IN_CONSULTATION",
        "COMPLETED",
        "CANCELLED",
        "NO_SHOW",
      ],
      default: "BOOKED",
    },

    chiefComplaint: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },

    followUpDate: Date,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Appointment", appointmentSchema);