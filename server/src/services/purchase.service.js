import Purchase from "../models/purchase.model.js";

export const generatePurchaseNumber = async () => {

  const count = await Purchase.countDocuments();

  return `PUR-${new Date().getFullYear()}-${String(
    count + 1
  ).padStart(6, "0")}`;

};
export const calculatePurchaseTotal = (
  items,
  gst = 0
) => {

  const subtotal = items.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const total = subtotal + gst;

  return {
    subtotal,
    total,
  };

};