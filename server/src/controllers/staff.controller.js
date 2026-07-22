import {
  generateStaffId,
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} from "../services/staff.service.js";

/**
 * Create Staff
 */
export const registerStaff = async (req, res) => {
  try {
    const staffId = await generateStaffId();

    const staff = await createStaff({
      ...req.body,
      clinic: req.user.clinic,
      staffId,
    });

    res.status(201).json({
      success: true,
      message: "Staff added successfully",
      staff,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get All Staff
 */
export const getStaffList = async (req, res) => {
  try {
    const staff = await getAllStaff(req.user.clinic);

    res.status(200).json({
      success: true,
      total: staff.length,
      staff,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Single Staff
 */
export const getSingleStaff = async (req, res) => {
  try {
    const staff = await getStaffById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found",
      });
    }

    res.status(200).json({
      success: true,
      staff,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update Staff
 */
export const updateStaffDetails = async (req, res) => {
  try {
    const staff = await updateStaff(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Staff updated successfully",
      staff,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete Staff
 */
export const removeStaff = async (req, res) => {
  try {
    await deleteStaff(req.params.id);

    res.status(200).json({
      success: true,
      message: "Staff removed successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};