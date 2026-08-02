import { body } from "express-validator";

export const prescriptionValidation = [
  body("patient").notEmpty().withMessage("Patient is required"),

  body("consultation")
    .notEmpty()
    .withMessage("Consultation is required"),

  body("medicines")
    .isArray({ min: 1 })
    .withMessage("At least one medicine is required"),

  body("medicines.*.medicine")
    .notEmpty()
    .withMessage("Medicine is required"),

  body("medicines.*.dosage")
    .notEmpty()
    .withMessage("Dosage is required"),

  body("medicines.*.frequency")
    .notEmpty()
    .withMessage("Frequency is required"),

  body("medicines.*.duration")
    .notEmpty()
    .withMessage("Duration is required"),

  body("medicines.*.quantity")
    .isNumeric()
    .withMessage("Quantity is required"),
];