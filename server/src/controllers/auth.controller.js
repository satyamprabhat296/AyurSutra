import User from "../models/user.model.js";
import Clinic from "../models/clinic.model.js";
import { generateToken } from "../utils/generateToken.js";

// Register
export const register = async (req, res) => {
  try {
    const {
      clinicId,
      name,
      designation,
      email,
      phone,
      password,
      role,
    } = req.body;

    // Validate required fields
    if (!clinicId || !name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory",
      });
    }

    // Check clinic
    const clinic = await Clinic.findById(clinicId);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Create user
    const user = await User.create({
      clinic: clinicId,
      name,
      designation,
      email,
      phone,
      password,
      role,
    });

    // Generate JWT
    const token = generateToken(user._id);

    // Set authentication cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "Registration Successful",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("========== LOGIN START ==========");
    console.log("EMAIL RECEIVED:", email);
    console.log("PASSWORD RECEIVED:", !!password);

    if (!email || !password) {
      console.log("LOGIN FAILED: Missing email or password");

      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    console.log("NORMALIZED EMAIL:", normalizedEmail);

    // Find user
    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    console.log("USER FOUND:", !!user);

    if (!user) {
      console.log("LOGIN FAILED: User not found");

      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    console.log("USER ID:", user._id);
    console.log("USER NAME:", user.name);
    console.log("USER ROLE:", user.role);
    console.log("PASSWORD HASH EXISTS:", !!user.password);
    console.log("ACCOUNT ACTIVE:", user.isActive);

    if (!user.isActive) {
      console.log("LOGIN FAILED: Account inactive");

      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    // Compare password
    console.log("CHECKING PASSWORD...");

    const isMatched = await user.comparePassword(password);

    console.log("PASSWORD MATCH:", isMatched);

    if (!isMatched) {
      console.log("LOGIN FAILED: Password mismatch");

      return res.status(401).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    // Update last login
    console.log("UPDATING LAST LOGIN...");

    user.lastLogin = new Date();

    await user.save();

    console.log("LAST LOGIN UPDATED");

    // Generate JWT
    console.log("GENERATING TOKEN...");

    const token = generateToken(user._id);

    console.log("TOKEN GENERATED");

    // Set authentication cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("COOKIE SET");

    // Remove password from response
    user.password = undefined;

    console.log("LOGIN SUCCESS");
    console.log("========== LOGIN END ==========");

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      user,
    });
  } catch (error) {
    console.error("========== LOGIN ERROR ==========");
    console.error("ERROR NAME:", error.name);
    console.error("ERROR MESSAGE:", error.message);
    console.error("ERROR STACK:", error.stack);
    console.error("========== LOGIN ERROR END ==========");

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Logout
export const logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({
      success: true,
      message: "Logout Successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Current User
export const getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

export const resetAdminPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.password = newPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};