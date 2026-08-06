import mongoose from "mongoose";

const purchaseItemSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    purchasePrice: {
      type: Number,
      required: true,
    },

    sellingPrice: {
      type: Number,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    batchNumber: {
      type: String,
      default: "",
    },

    expiryDate: {
      type: Date,
    },
  },
  {
    _id: false,
  }
);

const purchaseSchema = new mongoose.Schema(
  {
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },

    purchaseNumber: {
      type: String,
      required: true,
      unique: true,
    },

    supplier: {
      type: String,
      required: true,
      trim: true,
    },

    invoiceNumber: {
      type: String,
      default: "",
    },

    purchaseDate: {
      type: Date,
      default: Date.now,
    },

    items: [purchaseItemSchema],

    subtotal: {
      type: Number,
      default: 0,
    },

    gst: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      default: 0,
    },

    notes: {
      type: String,
      default: "",
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

export default mongoose.model("Purchase", purchaseSchema);