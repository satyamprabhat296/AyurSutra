import Patient from "../models/patient.model.js";
import Staff from "../models/staff.model.js";
import Appointment from "../models/appointment.model.js";
import Consultation from "../models/consultation.model.js";
import Billing from "../models/billing.model.js";
import Medicine from "../models/medicine.model.js";

export const getDashboard = async (req, res) => {
  try {
    const clinic = req.user.clinic;

    const totalPatients = await Patient.countDocuments({
      clinic,
    });

    const totalStaff = await Staff.countDocuments({
      clinic,
    });

    const totalMedicines = await Medicine.countDocuments({
      clinic,
    });

    const lowStockMedicines = await Medicine.countDocuments({
  clinic,
  $expr: {
    $lte: ["$currentStock", "$minimumStock"],
  },
});
const totalDoctors = await Staff.countDocuments({
  clinic,
  role: "DOCTOR",
});
    const today = new Date();

today.setHours(0, 0, 0, 0);

const tomorrow = new Date(today);

tomorrow.setDate(tomorrow.getDate() + 1);
const pendingBills = await Billing.countDocuments({
  clinic,
  paymentStatus: {
    $ne: "PAID",
  },
});

const todayAppointments =
  await Appointment.countDocuments({
    clinic,
    appointmentDate: {
      $gte: today,
      $lt: tomorrow,
    },
  });
const todayRevenue = todayBills.reduce(
  (sum, bill) => sum + bill.total,
  0
);
const monthStart = new Date();

monthStart.setDate(1);
monthStart.setHours(0, 0, 0, 0);

const monthlyBills = await Billing.find({
  clinic,
  paymentStatus: "PAID",
  createdAt: {
    $gte: monthStart,
  },
});

const monthlyRevenue = monthlyBills.reduce(
  (sum, bill) => sum + bill.total,
  0
);
const recentAppointments = await Appointment.find({
  clinic,
})
  .sort({ createdAt: -1 })
  .limit(5)
  .populate("patient", "patientId fullName")
  .populate("doctor", "name");
  const recentPatients = await Patient.find({
  clinic,
})
  .sort({ createdAt: -1 })
  .limit(5)
  .select("patientId fullName phone createdAt");
   res.status(200).json({
  success: true,
  dashboard: {
    totalPatients,
    totalStaff,
    totalDoctors,
    totalMedicines,
    lowStockMedicines,
    pendingBills,
    todayAppointments,
    todayConsultations,
    todayRevenue,
    monthlyRevenue,
    recentAppointments,
    recentPatients,
  },

    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};