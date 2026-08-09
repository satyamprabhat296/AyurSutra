import express from "express";

import {
  createPrescription,
  dispensePrescription,
  getPrescriptions,
  getPrescription,
  getPrescriptionPDF,
} from "../controllers/prescription.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

import validate from "../middlewares/validate.middleware.js";
import { prescriptionValidation } from "../validators/prescription.validator.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("super_admin", "doctor"),
  prescriptionValidation,
  validate,
  createPrescription
);

router.get(
  "/",
  protect,
  authorize("super_admin", "doctor", "pharmacist"),
  getPrescriptions
);
router.get(
  "/:id/pdf",
  protect,
  authorize(
    "super_admin",
    "doctor",
    "pharmacist"
  ),
  getPrescriptionPDF
);

router.get(
  "/:id",
  protect,
  authorize("super_admin", "doctor", "pharmacist"),
  getPrescription
);
router.post(
  "/:id/dispense",
  protect,
  authorize("super_admin", "pharmacist"),
  dispensePrescription
);

export default router;