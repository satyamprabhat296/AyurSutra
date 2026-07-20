import { body } from "express-validator";

export const patientValidation = [
  body("basicInfo.firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required"),

  body("basicInfo.gender")
    .notEmpty()
    .withMessage("Gender is required"),

  body("contact.phone")
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone number must be 10 digits"),
];