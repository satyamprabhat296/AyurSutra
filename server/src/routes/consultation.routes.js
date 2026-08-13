import express from "express";

import {
  createConsultation,
  getConsultations,
  getConsultation,
  updateConsultation,
} from "../controllers/consultation.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

import validate from "../middlewares/validate.middleware.js";
import {
  consultationValidation,
} from "../validators/consultation.validator.js";

const router = express.Router();


// Create consultation
router.post(
  "/",
  protect,
  authorize("super_admin", "doctor"),
  consultationValidation,
  validate,
  createConsultation
);


// Get all consultations
router.get(
  "/",
  protect,
  authorize(
    "super_admin",
    "doctor",
    "receptionist"
  ),
  getConsultations
);


// Get single consultation
router.get(
  "/:id",
  protect,
  authorize(
    "super_admin",
    "doctor",
    "receptionist"
  ),
  getConsultation
);


// Update consultation
router.put(
  "/:id",
  protect,
  authorize("super_admin", "doctor"),
  consultationValidation,
  validate, 
  updateConsultation
);


export default router;