import express from "express";
import { setupSystem } from "../controllers/setup.controller.js";

const router = express.Router();

// POST /api/v1/setup
router.post("/", setupSystem);

export default router;