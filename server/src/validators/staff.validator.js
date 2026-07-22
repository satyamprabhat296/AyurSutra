import { body } from "express-validator";

export const staffValidation = [
  body("name").notEmpty().withMessage("Name is required"),

  body("phone")
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone must be 10 digits"),

  body("role").notEmpty().withMessage("Role is required"),
];