import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import Clinic from "../models/clinic.model.js";

// ==========================================
// GET SETTINGS
// ==========================================
export const getSettings = async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.user.clinic);

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    const user = await User.findById(req.user._id).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,

      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },

      clinic: {
        id: clinic._id,
        name: clinic.name,
        registrationNumber: clinic.registrationNumber,
        phone: clinic.phone,
        email: clinic.email,
        address: clinic.address,
        city: clinic.city,
        state: clinic.state,
        pincode: clinic.pincode,
        website: clinic.website,
        logo: clinic.logo,
      },

      preferences: {
        currency: clinic.settings?.currency || "INR",
        dateFormat:
          clinic.settings?.dateFormat || "DD/MM/YYYY",
        appointmentDuration:
          clinic.settings?.appointmentDuration || 30,
      },
    });
  } catch (error) {
    console.error("Get Settings Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE PROFILE
// ==========================================
export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "email",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: user,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// CHANGE PASSWORD
// ==========================================
export const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE CLINIC SETTINGS
// ==========================================
export const updateClinicSettings = async (req, res) => {
  try {
    const clinic = await Clinic.findById(
      req.user.clinic
    );

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    const {
      name,
      registrationNumber,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      website,
      logo,
    } = req.body;

    if (name !== undefined) {
      clinic.name = name;
    }

    if (registrationNumber !== undefined) {
      clinic.registrationNumber = registrationNumber;
    }

    if (phone !== undefined) {
      clinic.phone = phone;
    }

    if (email !== undefined) {
      clinic.email = email;
    }

    if (address !== undefined) {
      clinic.address = address;
    }

    if (city !== undefined) {
      clinic.city = city;
    }

    if (state !== undefined) {
      clinic.state = state;
    }

    if (pincode !== undefined) {
      clinic.pincode = pincode;
    }

    if (website !== undefined) {
      clinic.website = website;
    }

    if (logo !== undefined) {
      clinic.logo = logo;
    }

    await clinic.save();

    res.status(200).json({
      success: true,
      message: "Clinic settings updated successfully",
      clinic,
    });
  } catch (error) {
    console.error("Update Clinic Settings Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE PREFERENCES
// ==========================================
export const updatePreferences = async (req, res) => {
  try {
    const clinic = await Clinic.findById(
      req.user.clinic
    );

    if (!clinic) {
      return res.status(404).json({
        success: false,
        message: "Clinic not found",
      });
    }

    const {
      currency,
      dateFormat,
      appointmentDuration,
    } = req.body;

    if (currency !== undefined) {
      clinic.settings.currency = currency;
    }

    if (dateFormat !== undefined) {
      clinic.settings.dateFormat = dateFormat;
    }

    if (appointmentDuration !== undefined) {
      clinic.settings.appointmentDuration =
        appointmentDuration;
    }

    await clinic.save();

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      preferences: clinic.settings,
    });
  } catch (error) {
    console.error("Update Preferences Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};