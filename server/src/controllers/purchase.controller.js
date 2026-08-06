import mongoose from "mongoose";

import Purchase from "../models/purchase.model.js";
import Medicine from "../models/medicine.model.js";
import Inventory from "../models/inventory.model.js";

import {
  generatePurchaseNumber,
  calculatePurchaseTotal,
} from "../services/purchase.service.js";

export const createPurchase = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const purchaseNumber = await generatePurchaseNumber();

    const { items, gst = 0 } = req.body;

    const totals = calculatePurchaseTotal(items, gst);

    const purchase = await Purchase.create(
      [
        {
          ...req.body,
          clinic: req.user.clinic,
          purchaseNumber,
          subtotal: totals.subtotal,
          total: totals.total,
          createdBy: req.user._id,
        },
      ],
      { session }
    );

    const savedPurchase = purchase[0];

    // Update stock and create inventory entries
    for (const item of savedPurchase.items) {
      const medicine = await Medicine.findById(item.medicine).session(
        session
      );

      if (!medicine) {
        throw new Error("Medicine not found.");
      }

      // Increase stock
      medicine.currentStock += item.quantity;

      // Update latest prices
      medicine.purchasePrice = item.purchasePrice;
      medicine.sellingPrice = item.sellingPrice;

      await medicine.save({ session });

      // Inventory transaction
      await Inventory.create(
        [
          {
            clinic: req.user.clinic,
            medicine: medicine._id,
            transactionType: "PURCHASE",
            quantity: item.quantity,
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate,
            supplier: savedPurchase.supplier,
            remarks: "Medicine Purchase",
            createdBy: req.user._id,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Purchase created successfully.",
      purchase: savedPurchase,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    session.endSession();
  }
};
export const getPurchases = async (req, res) => {
  try {

    const purchases = await Purchase.find({
      clinic: req.user.clinic,
    })
      .populate("createdBy", "name")
      .populate("items.medicine", "medicineName");

    res.status(200).json({
      success: true,
      total: purchases.length,
      purchases,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export const getPurchase = async (req, res) => {
  try {

    const purchase = await Purchase.findById(
      req.params.id
    )
      .populate("createdBy", "name")
      .populate("items.medicine");

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found.",
      });
    }

    res.status(200).json({
      success: true,
      purchase,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export const updatePurchase = async (req, res) => {
  res.status(501).json({
    success: false,
    message:
      "Updating purchases is disabled. Create a new purchase instead.",
  });
};

export const deletePurchase = async (req, res) => {
  res.status(501).json({
    success: false,
    message:
      "Deleting purchases is disabled to maintain inventory integrity.",
  });
};