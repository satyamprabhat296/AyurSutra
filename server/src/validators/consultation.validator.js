import { body } from "express-validator";

export const consultationValidation = [

  // Appointment
  body("appointment")
    .notEmpty()
    .withMessage("Appointment is required")
    .isMongoId()
    .withMessage("Invalid appointment ID"),

  // Patient
  body("patient")
    .notEmpty()
    .withMessage("Patient is required")
    .isMongoId()
    .withMessage("Invalid patient ID"),

  // Doctor
  body("doctor")
    .notEmpty()
    .withMessage("Doctor is required")
    .isMongoId()
    .withMessage("Invalid doctor ID"),

  // Vitals
  body("vitals.bloodPressure")
    .optional()
    .trim(),

  body("vitals.pulse")
    .optional()
    .isNumeric()
    .withMessage("Pulse must be a number"),

  body("vitals.temperature")
    .optional()
    .isNumeric()
    .withMessage("Temperature must be a number"),

  body("vitals.weight")
    .optional()
    .isNumeric()
    .withMessage("Weight must be a number"),

  body("vitals.height")
    .optional()
    .isNumeric()
    .withMessage("Height must be a number"),

  body("vitals.spo2")
    .optional()
    .isNumeric()
    .withMessage("SpO2 must be a number"),

  // Chief complaint
  body("chiefComplaint")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage(
      "Chief complaint cannot exceed 1000 characters"
    ),

  // Diagnosis
  body("diagnosis")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage(
      "Diagnosis cannot exceed 2000 characters"
    ),

  // Prescription
  body("prescription")
    .optional()
    .isArray()
    .withMessage("Prescription must be an array"),

  // Therapies
  body("therapies")
    .optional()
    .isArray()
    .withMessage("Therapies must be an array"),

  // Advice
  body("advice")
    .optional()
    .trim()
    .isLength({ max: 3000 })
    .withMessage(
      "Advice cannot exceed 3000 characters"
    ),

  // Follow-up date
  body("followUpDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage(
      "Follow-up date must be a valid date"
    ),
];