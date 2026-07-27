import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import setupRoutes from "./routes/setup.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import staffRoutes from "./routes/staff.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import consultationRoutes from "./routes/consultation.routes.js";
import billingRoutes from "./routes/billing.routes.js";
import errorHandler from "./middlewares/error.middleware.js";
import medicineRoutes from "./routes/medicine.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/consultations", consultationRoutes);
app.use("/api/v1/billing", billingRoutes);
app.use("/api/v1/medicines", medicineRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AyurSutra API Running",
  });
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/setup", setupRoutes);
app.use("/api/v1/patients", patientRoutes);
app.use("/api/v1/staff", staffRoutes);
// 404 handler (MUST BE LAST)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// Error handler (LAST middleware)
app.use(errorHandler);

export default app;