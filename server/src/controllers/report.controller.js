import Appointment from "../models/appointment.model.js";
import Consultation from "../models/consultation.model.js";
import Billing from "../models/billing.model.js";
import Medicine from "../models/medicine.model.js";
import Inventory from "../models/inventory.model.js";
import Purchase from "../models/purchase.model.js";

// ==========================================
// DATE RANGE HELPER
// ==========================================
const getDateRange = (from, to) => {
  const startDate = from
    ? new Date(from)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const endDate = to
    ? new Date(to)
    : new Date();

  // Include the complete "to" day
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate,
    endDate,
  };
};

// ==========================================
// REPORT SUMMARY
// ==========================================
export const getReportSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const clinic = req.user.clinic;

    const { startDate, endDate } = getDateRange(from, to);

    // ------------------------------------------
    // BILLING
    // ------------------------------------------
    const billingSummary = await Billing.aggregate([
      {
        $match: {
          clinic,
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          totalPaid: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "PAID"] },
                "$total",
                0,
              ],
            },
          },
          pendingAmount: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "PENDING"] },
                "$total",
                0,
              ],
            },
          },
        },
      },
    ]);

    // ------------------------------------------
    // APPOINTMENTS
    // ------------------------------------------
    const appointmentSummary = await Appointment.aggregate([
      {
        $match: {
          clinic,
          appointmentDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // ------------------------------------------
    // CONSULTATIONS
    // ------------------------------------------
    const consultationCount = await Consultation.countDocuments({
      clinic,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    // ------------------------------------------
    // MEDICINE
    // ------------------------------------------
    const medicineSummary = await Medicine.aggregate([
      {
        $match: {
          clinic,
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          totalMedicines: { $sum: 1 },
          totalStock: { $sum: "$currentStock" },
          lowStockMedicines: {
            $sum: {
              $cond: [
                {
                  $lte: [
                    "$currentStock",
                    "$minimumStock",
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // ------------------------------------------
    // INVENTORY
    // ------------------------------------------
    const inventorySummary = await Inventory.aggregate([
      {
        $match: {
          clinic,
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$transactionType",
          quantity: { $sum: "$quantity" },
          transactions: { $sum: 1 },
        },
      },
    ]);

    // ------------------------------------------
    // PURCHASES
    // ------------------------------------------
    const purchaseSummary = await Purchase.aggregate([
      {
        $match: {
          clinic,
          purchaseDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalPurchases: { $sum: 1 },
          purchaseAmount: { $sum: "$total" },
        },
      },
    ]);

    // ------------------------------------------
    // FORMAT APPOINTMENT DATA
    // ------------------------------------------
    const appointments = {
      total: 0,
      completed: 0,
      pending: 0,
      cancelled: 0,
      confirmed: 0,
    };

    appointmentSummary.forEach((item) => {
      const status = item._id?.toLowerCase();

      appointments.total += item.count;

      if (status === "completed") {
        appointments.completed = item.count;
      }

      if (status === "pending") {
        appointments.pending = item.count;
      }

      if (status === "cancelled") {
        appointments.cancelled = item.count;
      }

      if (status === "confirmed") {
        appointments.confirmed = item.count;
      }
    });

    const billing = billingSummary[0] || {
      totalInvoices: 0,
      totalRevenue: 0,
      totalPaid: 0,
      pendingAmount: 0,
    };

    const medicines = medicineSummary[0] || {
      totalMedicines: 0,
      totalStock: 0,
      lowStockMedicines: 0,
    };

    const purchases = purchaseSummary[0] || {
      totalPurchases: 0,
      purchaseAmount: 0,
    };

    res.status(200).json({
      success: true,

      dateRange: {
        from: startDate,
        to: endDate,
      },

      summary: {
        revenue: billing.totalRevenue,
        paidRevenue: billing.totalPaid,
        pendingRevenue: billing.pendingAmount,

        totalInvoices: billing.totalInvoices,

        appointments: appointments.total,
        completedAppointments: appointments.completed,
        pendingAppointments: appointments.pending,
        cancelledAppointments: appointments.cancelled,

        consultations: consultationCount,

        medicines: medicines.totalMedicines,
        currentStock: medicines.totalStock,
        lowStockMedicines: medicines.lowStockMedicines,

        purchases: purchases.totalPurchases,
        purchaseAmount: purchases.purchaseAmount,
      },

      appointmentBreakdown: appointmentSummary,

      inventoryBreakdown: inventorySummary,
    });
  } catch (error) {
    console.error("Report Summary Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// REVENUE REPORT
// ==========================================
export const getRevenueReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const clinic = req.user.clinic;

    const { startDate, endDate } = getDateRange(from, to);

    const revenue = await Billing.aggregate([
      {
        $match: {
          clinic,
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },

          revenue: {
            $sum: "$total",
          },

          invoices: {
            $sum: 1,
          },

          paid: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "PAID"] },
                "$total",
                0,
              ],
            },
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      dateRange: {
        from: startDate,
        to: endDate,
      },
      revenue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// APPOINTMENT REPORT
// ==========================================
export const getAppointmentReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const clinic = req.user.clinic;

    const { startDate, endDate } = getDateRange(from, to);

    const appointments = await Appointment.aggregate([
      {
        $match: {
          clinic,
          appointmentDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      dateRange: {
        from: startDate,
        to: endDate,
      },
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// PHARMACY REPORT
// ==========================================
export const getPharmacyReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const clinic = req.user.clinic;

    const { startDate, endDate } = getDateRange(from, to);

    // Inventory movement
    const inventory = await Inventory.aggregate([
      {
        $match: {
          clinic,
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: "$transactionType",
          quantity: {
            $sum: "$quantity",
          },
          transactions: {
            $sum: 1,
          },
        },
      },
    ]);

    // Current low stock
    const lowStock = await Medicine.find({
      clinic,
      isActive: true,
      $expr: {
        $lte: ["$currentStock", "$minimumStock"],
      },
    })
      .select(
        "medicineCode medicineName category currentStock minimumStock"
      )
      .sort({
        currentStock: 1,
      });

    res.status(200).json({
      success: true,

      dateRange: {
        from: startDate,
        to: endDate,
      },

      inventory,

      lowStock: {
        count: lowStock.length,
        medicines: lowStock,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};