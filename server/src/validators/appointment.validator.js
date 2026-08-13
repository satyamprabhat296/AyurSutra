import { body } from "express-validator";

export const appointmentValidation = [
  body("patient")
    .notEmpty()
    .withMessage("Patient is required")
    .isMongoId()
    .withMessage("Invalid patient ID"),

  body("doctor")
    .notEmpty()
    .withMessage("Doctor is required")
    .isMongoId()
    .withMessage("Invalid doctor ID"),

  body("appointmentDate")
    .notEmpty()
    .withMessage("Appointment date is required")
    .isISO8601()
    .withMessage("Invalid appointment date"),

  body("appointmentTime")
    .trim()
    .notEmpty()
    .withMessage("Appointment time is required"),

  body("visitType")
    .optional()
    .isIn(["NEW", "FOLLOW_UP"])
    .withMessage("Invalid visit type"),

  body("chiefComplaint")
    .optional()
    .trim(),

  body("notes")
    .optional()
    .trim(),

  body("followUpDate")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Invalid follow-up date"),
];