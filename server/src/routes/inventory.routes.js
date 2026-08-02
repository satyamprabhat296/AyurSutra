import express from "express";

import {
  createInventoryTransaction,
  getInventoryHistory,
} from "../controllers/inventory.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("super_admin", "pharmacist"),
  createInventoryTransaction
);

router.get(
  "/",
  protect,
  authorize("super_admin", "pharmacist"),
  getInventoryHistory
);

export default router;