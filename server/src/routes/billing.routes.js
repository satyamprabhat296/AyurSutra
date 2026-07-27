import express from "express";

import {
  createBill,
  getBills,
  getBill,
  markBillPaid,
} from "../controllers/billing.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("super_admin", "accountant", "receptionist"),
  createBill
);

router.get(
  "/",
  protect,
  authorize("super_admin", "accountant", "receptionist"),
  getBills
);

router.get(
  "/:id",
  protect,
  authorize("super_admin", "accountant", "receptionist"),
  getBill
);

router.patch(
  "/:id/pay",
  protect,
  authorize("super_admin", "accountant"),
  markBillPaid
);

export default router;