import express from "express";

import { getDashboard } from "../controllers/dashboard.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router.get(
  "/",
  protect,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.DOCTOR,
    ROLES.RECEPTIONIST,
    ROLES.ACCOUNTANT
  ),
  getDashboard
);

export default router;