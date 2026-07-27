import Billing from "../models/billing.model.js";

import {
  generateInvoiceNumber,
  calculateBill,
} from "../services/billing.service.js";

export const createBill = async (req, res) => {

  try {

    const invoiceNumber =
      await generateInvoiceNumber();

    const { items, discount, tax } = req.body;

    const totals = calculateBill(
      items,
      discount,
      tax
    );

    const bill = await Billing.create({
      ...req.body,
      clinic: req.user.clinic,
      invoiceNumber,
      subtotal: totals.subtotal,
      total: totals.total,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Bill generated successfully",
      bill,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};
export const getBills = async (req, res) => {
  try {

    const bills = await Billing.find({
      clinic: req.user.clinic,
    })
      .populate("patient", "patientId fullName phone")
      .populate("appointment", "appointmentNumber")
      .populate("consultation");

    res.status(200).json({
      success: true,
      total: bills.length,
      bills,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


export const getBill = async (req, res) => {

  try {

    const bill = await Billing.findById(req.params.id)
      .populate("patient")
      .populate("appointment")
      .populate("consultation");

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    res.status(200).json({
      success: true,
      bill,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};


export const markBillPaid = async (req, res) => {

  try {

    const bill = await Billing.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    bill.paymentStatus = "PAID";

    if (req.body.paymentMethod) {
      bill.paymentMethod = req.body.paymentMethod;
    }

    await bill.save();

    res.status(200).json({
      success: true,
      message: "Payment received successfully",
      bill,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};



