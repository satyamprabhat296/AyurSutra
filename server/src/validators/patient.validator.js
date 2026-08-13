import { body } from "express-validator";

export const patientValidation = [
  // Basic Information
  body("basicInfo.firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required"),

  body("basicInfo.lastName")
    .optional()
    .trim(),

  body("basicInfo.gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be Male, Female, or Other"),

  body("basicInfo.age")
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage("Age must be between 0 and 150"),

  // Contact
  body("contact.phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone number must be 10 digits")
    .isNumeric() 
    .withMessage("Phone number must contain only digits"),

  body("contact.email")
    .optional({ values: "falsy" })
    .isEmail()
    .withMessage("Please provide a valid email address"),
]; 