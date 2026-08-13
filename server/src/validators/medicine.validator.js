import { body } from "express-validator";

export const medicineValidation = [
  body("medicineName")
    .trim()
    .notEmpty()
    .withMessage("Medicine name is required"),

  body("category")
    .notEmpty()
    .withMessage("Category is required"),

  body("sellingPrice")
    .notEmpty()
    .withMessage("Selling price is required")
    .isNumeric()
    .withMessage("Selling price must be a number"),

  body("purchasePrice")
    .notEmpty()
    .withMessage("Purchase price is required")
    .isNumeric()
    .withMessage("Purchase price must be a number"),

  body("gst")
    .optional()
    .isNumeric()
    .withMessage("GST must be a number"),

  body("currentStock")
    .optional()
    .isNumeric()
    .withMessage("Current stock must be a number"),

  body("minimumStock")
    .optional()
    .isNumeric()
    .withMessage("Minimum stock must be a number"),
];