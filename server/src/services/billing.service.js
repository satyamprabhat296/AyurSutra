import Billing from "../models/billing.model.js";

export const generateInvoiceNumber = async () => {

  const year = new Date().getFullYear();

  const last = await Billing.findOne()
    .sort({ createdAt: -1 })
    .select("invoiceNumber");

  let sequence = 1;

  if (last) {
    sequence =
      Number(last.invoiceNumber.split("-")[2]) + 1;
  }

  return `INV-${year}-${String(sequence).padStart(6, "0")}`;
};

export const calculateBill = (items, discount = 0, tax = 0) => {

  const subtotal = items.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const total = subtotal - discount + tax;

  return {
    subtotal,
    total,
  };
};