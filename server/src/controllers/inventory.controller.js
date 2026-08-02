import Inventory from "../models/inventory.model.js";

import { updateMedicineStock } from "../services/inventory.service.js";

export const createInventoryTransaction = async (req, res) => {

  try {

    await updateMedicineStock(
      req.body.medicine,
      req.body.transactionType,
      req.body.quantity
    );

    const transaction = await Inventory.create({
      ...req.body,
      clinic: req.user.clinic,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Inventory updated successfully",
      transaction,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};


export const getInventoryHistory = async (req, res) => {

    try{

        const history=await Inventory.find({
            clinic:req.user.clinic
        })
        .populate("medicine");

        res.status(200).json({
            success:true,
            total:history.length,
            history
        });

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

}