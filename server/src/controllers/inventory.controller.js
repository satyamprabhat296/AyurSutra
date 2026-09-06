// import Inventory from "../models/inventory.model.js";

// import { updateMedicineStock } from "../services/inventory.service.js";

// export const createInventoryTransaction = async (req, res) => {

//   try {

//     await updateMedicineStock(
//       req.body.medicine,
//       req.body.transactionType,
//       req.body.quantity
//     );

//     const transaction = await Inventory.create({
//       ...req.body,
//       clinic: req.user.clinic,
//       createdBy: req.user._id,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Inventory updated successfully",
//       transaction,
//     });

//   } catch (error) {

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });

//   }

// };


// export const getInventoryHistory = async (req, res) => {

//     try{

//         const history=await Inventory.find({
//             clinic:req.user.clinic
//         })
//         .populate("medicine");

//         res.status(200).json({
//             success:true,
//             total:history.length,
//             history
//         });

//     }catch(error){

//         res.status(500).json({
//             success:false,
//             message:error.message
//         });

//     }

// }

import Inventory from "../models/inventory.model.js";
import { updateMedicineStock } from "../services/inventory.service.js";

// ==========================================
// CREATE INVENTORY TRANSACTION
// ==========================================
export const createInventoryTransaction = async (req, res) => {
  try {
    const {
      medicine,
      transactionType,
      quantity,
      batchNumber,
      expiryDate,
      supplier,
      remarks,
    } = req.body;

    if (!medicine) {
      return res.status(400).json({
        success: false,
        message: "Medicine is required",
      });
    }

    if (!transactionType) {
      return res.status(400).json({
        success: false,
        message: "Transaction type is required",
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const updatedMedicine = await updateMedicineStock(
      medicine,
      transactionType,
      quantity,
      req.user.clinic
    );

    const transaction = await Inventory.create({
      medicine,
      transactionType,
      quantity,
      batchNumber,
      expiryDate,
      supplier,
      remarks,
      clinic: req.user.clinic,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Inventory updated successfully",
      transaction,
      medicine: updatedMedicine,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET INVENTORY HISTORY
// ==========================================
export const getInventoryHistory = async (req, res) => {
  try {
    const history = await Inventory.find({
      clinic: req.user.clinic,
    })
      .populate("medicine")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: history.length,
      history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};