import Clinic from "../models/clinic.model.js";
import User from "../models/user.model.js";
import { ROLES } from "../constants/roles.js";
import { generateToken } from "../utils/generateToken.js";

export const setupSystem = async (req, res) => {
  try {
    const { clinic, admin } = req.body;

    // Check if system is already initialized
    const existingClinic = await Clinic.findOne();

    if (existingClinic) {
      return res.status(400).json({
        success: false,
        message: "System is already configured.",
      });
    }

    // Create Clinic
    const newClinic = await Clinic.create({
      name: clinic.name,
      email: clinic.email,
      phone: clinic.phone,
      address: clinic.address,
      isSetupComplete: true,
    });

    // Create Super Admin
    const superAdmin = await User.create({
      clinic: newClinic._id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      password: admin.password,
      role: ROLES.SUPER_ADMIN,
    });

    // Generate JWT
    const token = generateToken(superAdmin._id);

    // Set Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Change to true in production with HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "System setup completed successfully.",
      clinic: newClinic,
      admin: {
        _id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role,
      },
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}; 