import express from "express";

import {
  registerPatient,
  getAllPatients,
  getPatient,
  updatePatient,
  deletePatient,
} from "../controllers/patient.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

import validate from "../middlewares/validate.middleware.js";

import { patientValidation } from "../validators/patient.validator.js";

const router = express.Router();

router.post(
  "/",
  protect,
  patientValidation,
  validate,
  registerPatient
);

router.get("/", protect, getAllPatients);

router.get("/:id", protect, getPatient);

router.put("/:id", protect, updatePatient);

router.delete("/:id", protect, deletePatient);

export default router; 