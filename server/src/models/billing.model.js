import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: [
        "CONSULTATION",
        "THERAPY",
        "MEDICINE",
        "LAB",
        "OTHER",
      ],
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
    },

    price: {
      type: Number,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const billingSchema = new mongoose.Schema(
  {
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },

    consultation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
    },

    items: [itemSchema],

    subtotal: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    tax: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "PARTIAL",
        "PAID",
      ],
      default: "PENDING",
    },

    paymentMethod: {
      type: String,
      enum: [
        "CASH",
        "UPI",
        "CARD",
        "BANK_TRANSFER",
      ],
      default: "CASH",
    },

    notes: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Billing", billingSchema);