import Medicine from "../models/medicine.model.js";

export const updateMedicineStock = async (
  medicineId,
  transactionType,
  quantity
) => {

  const medicine = await Medicine.findById(medicineId);

  if (!medicine) {
    throw new Error("Medicine not found");
  }

  switch (transactionType) {

    case "PURCHASE":
    case "RETURN":
      medicine.currentStock += quantity;
      break;

    case "ISSUE":
    case "DAMAGE":
    case "EXPIRED":

      if (medicine.currentStock < quantity) {
        throw new Error("Insufficient Stock");
      }

      medicine.currentStock -= quantity;
      break;

    case "ADJUSTMENT":
      medicine.currentStock = quantity;
      break;

    default:
      break;
  }

  await medicine.save();

  return medicine;
};