import { body } from "express-validator";

export const purchaseValidation = [
  body("supplier")
    .trim()
    .notEmpty()
    .withMessage("Supplier is required"),

  body("items")
    .isArray({ min: 1 })
    .withMessage(
      "At least one medicine is required"
    ),

  body("items.*.medicine")
    .notEmpty()
    .withMessage("Medicine is required"),

  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage(
      "Quantity must be at least 1"
    ),

  body("items.*.purchasePrice")
    .isFloat({ min: 0 })
    .withMessage(
      "Purchase price must be a valid number"
    ),

  body("items.*.gst")
    .optional()
    .isFloat({ min: 0 })
    .withMessage(
      "GST must be a valid number"
    ),

  body("paymentStatus")
    .optional()
    .isIn([
      "PENDING",
      "PARTIAL",
      "PAID",
    ])
    .withMessage(
      "Invalid payment status"
    ),

  body("paymentMethod")
    .optional()
    .isIn([
      "CASH",
      "UPI",
      "CARD",
      "BANK_TRANSFER",
    ])
    .withMessage(
      "Invalid payment method"
    ),
];