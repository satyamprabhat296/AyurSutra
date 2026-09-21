import express from "express";

import {
  getSettings,
  updateProfile,
  changePassword,
  updateClinicSettings,
  updatePreferences,
} from "../controllers/settings.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import  authorize  from "../middlewares/authorize.middleware.js";

const router = express.Router();

// ==========================================
// GET ALL SETTINGS
// ==========================================
router.get(
  "/",
  protect,
  authorize(
    "super_admin",
    "doctor",
    "receptionist",
    "therapist",
    "pharmacist",
    "accountant"
  ),
  getSettings
);

// ==========================================
// PROFILE
// ==========================================
router.put(
  "/profile",
  protect,
  authorize(
    "super_admin",
    "doctor",
    "receptionist",
    "therapist",
    "pharmacist",
    "accountant"
  ),
  updateProfile
);

// ==========================================
// CHANGE PASSWORD
// ==========================================
router.put(
  "/password",
  protect,
  authorize(
    "super_admin",
    "doctor",
    "receptionist",
    "therapist",
    "pharmacist",
    "accountant"
  ),
  changePassword
);

// ==========================================
// CLINIC SETTINGS
// ==========================================
router.put(
  "/clinic",
  protect,
  authorize("super_admin"),
  updateClinicSettings
);

// ==========================================
// PREFERENCES
// ==========================================
router.put(
  "/preferences",
  protect,
  authorize("super_admin"),
  updatePreferences
);

export default router;