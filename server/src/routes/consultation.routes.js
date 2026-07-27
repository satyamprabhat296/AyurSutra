import express from "express";

import {
  createConsultation,
  getConsultations,
  getConsultation,
  updateConsultation,
} from "../controllers/consultation.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("super_admin", "doctor"),
  createConsultation
);

router.get(
  "/",
  protect,
  authorize("super_admin", "doctor", "receptionist"),
  getConsultations
);

router.get(
  "/:id",
  protect,
  authorize("super_admin", "doctor", "receptionist"),
  getConsultation
);

router.put(
  "/:id",
  protect,
  authorize("super_admin", "doctor"),
  updateConsultation
);

export default router;