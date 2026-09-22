import express from "express";

import {
  register,
  login,
  logout,
  getCurrentUser,
  resetAdminPassword,
} from "../controllers/auth.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);
router.post("/reset-password", resetAdminPassword);

router.post("/logout", logout);

router.get("/me", protect, getCurrentUser);

export default router;