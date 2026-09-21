import mongoose from "mongoose";

const clinicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    registrationNumber: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    address: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    pincode: {
      type: String,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    logo: {
      type: String,
      trim: true,
    },

    settings: {
      currency: {
        type: String,
        default: "INR",
      },

      dateFormat: {
        type: String,
        default: "DD/MM/YYYY",
      },

      appointmentDuration: {
        type: Number,
        default: 30,
        min: 5,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Clinic", clinicSchema);