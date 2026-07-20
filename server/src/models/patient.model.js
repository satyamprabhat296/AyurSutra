import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },

    patientId: {
      type: String,
      required: true,
      unique: true,
    },

    registrationType: {
      type: String,
      enum: ["OPD", "IPD"],
      default: "OPD",
    },

    basicInfo: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },

      lastName: {
        type: String,
        default: "",
        trim: true,
      },

      gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true,
      },

      dob: Date,

      age: Number,

      bloodGroup: String,

      maritalStatus: String,

      occupation: String,

      aadhaarNumber: String,

      profileImage: String,
    },

    contact: {
      phone: {
        type: String,
        required: true,
      },

      alternatePhone: String,

      email: String,

      address: String,

      city: String,

      state: String,

      pincode: String,

      country: {
        type: String,
        default: "India",
      },
    },

    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },

    medicalHistory: {
      diabetes: {
        type: Boolean,
        default: false,
      },

      hypertension: {
        type: Boolean,
        default: false,
      },

      allergies: [String],

      surgeries: [String],

      medications: [String],
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

patientSchema.index({ patientId: 1 });
patientSchema.index({ "basicInfo.firstName": "text", "basicInfo.lastName": "text" });
patientSchema.index({ "contact.phone": 1 });

export default mongoose.model("Patient", patientSchema);