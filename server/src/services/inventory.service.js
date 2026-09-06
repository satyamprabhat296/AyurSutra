// import Medicine from "../models/medicine.model.js";

// export const updateMedicineStock = async (
//   medicineId,
//   transactionType,
//   quantity
// ) => {

//   const medicine = await Medicine.findById(medicineId);

//   if (!medicine) {
//     throw new Error("Medicine not found");
//   }

//   switch (transactionType) {

//     case "PURCHASE":
//     case "RETURN":
//       medicine.currentStock += quantity;
//       break;

//     case "ISSUE":
//     case "DAMAGE":
//     case "EXPIRED":

//       if (medicine.currentStock < quantity) {
//         throw new Error("Insufficient Stock");
//       }

//       medicine.currentStock -= quantity;
//       break;

//     case "ADJUSTMENT":
//       medicine.currentStock = quantity;
//       break;

//     default:
//       break;
//   }

//   await medicine.save();

//   return medicine;
// };


import Medicine from "../models/medicine.model.js";

export const updateMedicineStock = async (
  medicineId,
  transactionType,
  quantity,
  clinic
) => {
  const medicine = await Medicine.findOne({
    _id: medicineId,
    clinic,
    isActive: true,
  });

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
      throw new Error("Invalid transaction type");
  }

  await medicine.save();

  return medicine;
};