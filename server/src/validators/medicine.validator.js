import { body } from "express-validator";

export const medicineValidation = [

  body("medicineName")
    .notEmpty()
    .withMessage("Medicine name is required"),

  body("category")
    .notEmpty()
    .withMessage("Category is required"),

  body("sellingPrice")
    .isNumeric()
    .withMessage("Selling price must be a number"),

  body("purchasePrice")
    .isNumeric()
    .withMessage("Purchase price must be a number"),

];