import express from "express";

import {
  revenueReport,
  todayRevenue,
  monthlyRevenue,
  patientReport,
  appointmentReport,
  inventoryReport,
  doctorReport,
} from "../controllers/report.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

const reportAccess = [
  ROLES.SUPER_ADMIN,
  ROLES.ACCOUNTANT,
];

router.get(
  "/revenue",
  protect,
  authorize(...reportAccess),
  revenueReport
);

router.get(
  "/revenue/today",
  protect,
  authorize(...reportAccess),
  todayRevenue
);

router.get(
  "/revenue/month",
  protect,
  authorize(...reportAccess),
  monthlyRevenue
);

router.get(
  "/patients",
  protect,
  authorize(...reportAccess),
  patientReport
);

router.get(
  "/appointments",
  protect,
  authorize(...reportAccess),
  appointmentReport
);

router.get(
  "/inventory",
  protect,
  authorize(...reportAccess),
  inventoryReport
);

router.get(
  "/doctor",
  protect,
  authorize(...reportAccess),
  doctorReport
);

export default router;