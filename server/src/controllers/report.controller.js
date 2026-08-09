import {
  getRevenueReport,
  getTodayRevenue,
  getMonthlyRevenue,
  getPatientReport,
  getAppointmentReport,
  getInventoryReport,
  getDoctorReport,
} from "../services/report.service.js";


// --------------------------------------------------
// Revenue Report
// --------------------------------------------------

export const revenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required.",
      });
    }

    const report = await getRevenueReport(
      req.user.clinic,
      new Date(startDate),
      new Date(endDate)
    );

    res.status(200).json({
      success: true,
      report,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// --------------------------------------------------
// Today's Revenue
// --------------------------------------------------

export const todayRevenue = async (req, res) => {
  try {
    const revenue = await getTodayRevenue(
      req.user.clinic
    );

    res.status(200).json({
      success: true,
      todayRevenue: revenue,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// --------------------------------------------------
// Monthly Revenue
// --------------------------------------------------

export const monthlyRevenue = async (req, res) => {
  try {
    const revenue = await getMonthlyRevenue(
      req.user.clinic
    );

    res.status(200).json({
      success: true,
      monthlyRevenue: revenue,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// --------------------------------------------------
// Patient Report
// --------------------------------------------------

export const patientReport = async (req, res) => {
  try {
    const report = await getPatientReport(
      req.user.clinic
    );

    res.status(200).json({
      success: true,
      report,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// --------------------------------------------------
// Appointment Report
// --------------------------------------------------

export const appointmentReport = async (req, res) => {
  try {
    const report = await getAppointmentReport(
      req.user.clinic
    );

    res.status(200).json({
      success: true,
      report,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// --------------------------------------------------
// Inventory Report
// --------------------------------------------------

export const inventoryReport = async (req, res) => {
  try {
    const report = await getInventoryReport(
      req.user.clinic
    );

    res.status(200).json({
      success: true,
      report,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// --------------------------------------------------
// Doctor Report
// --------------------------------------------------

export const doctorReport = async (req, res) => {
  try {
    const report = await getDoctorReport(
      req.user.clinic
    );

    res.status(200).json({
      success: true,
      report,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};