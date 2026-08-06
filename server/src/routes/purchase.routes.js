import express from "express";

import {
  createPurchase,
  getPurchases,
  getPurchase,
  updatePurchase,
  deletePurchase,
} from "../controllers/purchase.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.PHARMACIST
  ),
  createPurchase
);

router.get(
  "/",
  protect,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.PHARMACIST
  ),
  getPurchases
);

router.get(
  "/:id",
  protect,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.PHARMACIST
  ),
  getPurchase
);

router.put(
  "/:id",
  protect,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.PHARMACIST
  ),
  updatePurchase
);

router.delete(
  "/:id",
  protect,
  authorize(
    ROLES.SUPER_ADMIN
  ),
  deletePurchase
);

export default router;