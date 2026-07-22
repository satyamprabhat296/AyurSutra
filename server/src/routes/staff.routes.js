import express from "express";

import {
  registerStaff,
  getStaffList,
  getSingleStaff,
  updateStaffDetails,
  removeStaff,
} from "../controllers/staff.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { staffValidation } from "../validators/staff.validator.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize(ROLES.SUPER_ADMIN),
  staffValidation,
  validate,
  registerStaff
);

router.get(
  "/",
  protect,
  authorize(ROLES.SUPER_ADMIN),
  getStaffList
);

router.get(
  "/:id",
  protect,
  authorize(ROLES.SUPER_ADMIN),
  getSingleStaff
);

router.put(
  "/:id",
  protect,
  authorize(ROLES.SUPER_ADMIN),
  updateStaffDetails
);

router.delete(
  "/:id",
  protect,
  authorize(ROLES.SUPER_ADMIN),
  removeStaff
);

export default router;