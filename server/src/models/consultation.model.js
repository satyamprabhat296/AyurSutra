import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    medicine: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String,
  },
  { _id: false }
);

const therapySchema = new mongoose.Schema(
  {
    therapy: String,
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    sessions: Number,
    status: {
      type: String,
      default: "PENDING",
    },
  },
  { _id: false }
);

const consultationSchema = new mongoose.Schema(
  {
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
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

    vitals: {
      bloodPressure: String,
      pulse: Number,
      temperature: Number,
      weight: Number,
      height: Number,
      spo2: Number,
    },

    chiefComplaint: String,

    diagnosis: String,

    prescription: [medicineSchema],

    therapies: [therapySchema],

    advice: String,

    followUpDate: Date,

    status: {
      type: String,
      default: "COMPLETED",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Consultation", consultationSchema);