import express from "express";

import {
  createMedicine,
  getMedicines,
  getMedicine,
  updateMedicine,
  deleteMedicine,
} from "../controllers/medicine.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import authorize from "../middlewares/authorize.middleware.js";

import validate from "../middlewares/validate.middleware.js";
import { medicineValidation } from "../validators/medicine.validator.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("super_admin", "pharmacist"),
  medicineValidation,
  validate,
  createMedicine
);

router.get(
  "/",
  protect,
  authorize("super_admin", "pharmacist", "doctor"),
  getMedicines
);

router.get(
  "/:id",
  protect,
  authorize("super_admin", "pharmacist", "doctor"),
  getMedicine
);

router.put(
  "/:id",
  protect,
  authorize("super_admin", "pharmacist"),
  medicineValidation,
  validate,
  updateMedicine
);

router.delete(
  "/:id",
  protect,
  authorize("super_admin", "pharmacist"),
  deleteMedicine
);

export default router;