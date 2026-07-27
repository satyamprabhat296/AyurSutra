import { body } from "express-validator";

export const appointmentValidation = [

  body("patient")
    .notEmpty()
    .withMessage("Patient is required"),

  body("doctor")
    .notEmpty()
    .withMessage("Doctor is required"),

  body("appointmentDate")
    .notEmpty()
    .withMessage("Appointment date is required"),

  body("appointmentTime")
    .notEmpty()
    .withMessage("Appointment time is required"),

];