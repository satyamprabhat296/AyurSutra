import express from "express";

import {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  updateAppointmentStatus,
  cancelAppointment,
} from "../controllers/appointment.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

import validate from "../middlewares/validate.middleware.js";
import { appointmentValidation } from "../validators/appointment.validator.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("super_admin", "receptionist"),
  appointmentValidation,
  validate,
  createAppointment
);

router.get(
  "/",
  protect,
  authorize("super_admin", "receptionist", "doctor"),
  getAppointments
);

router.get(
  "/:id",
  protect,
  authorize("super_admin", "receptionist", "doctor"),
  getAppointment
);

router.put(
  "/:id",
  protect,
  authorize("super_admin", "receptionist"),
  updateAppointment
);

router.patch(
  "/:id/status",
  protect,
  authorize("super_admin", "doctor", "receptionist"),
  updateAppointmentStatus
);

router.delete(
  "/:id",
  protect,
  authorize("super_admin", "receptionist"),
  cancelAppointment
);

export default router;