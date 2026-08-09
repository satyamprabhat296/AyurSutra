import Billing from "../models/billing.model.js";
import Patient from "../models/patient.model.js";
import Appointment from "../models/appointment.model.js";
import Consultation from "../models/consultation.model.js";
import Medicine from "../models/medicine.model.js";  
export const getRevenueReport = async (
  clinic,
  startDate,
  endDate
) => {

  const bills = await Billing.find({
    clinic,
    paymentStatus: "PAID",
    createdAt: { 
      $gte: startDate,
      $lte: endDate,
    },
  });

  const totalRevenue = bills.reduce(
    (sum, bill) => sum + bill.total,
    0
  );

  return {
    totalBills: bills.length,
    totalRevenue,
    bills,
  };
};

export const getTodayRevenue = async (clinic) => {

  const today = new Date();

  today.setHours(0,0,0,0);

  const tomorrow = new Date(today);

  tomorrow.setDate(tomorrow.getDate()+1);

  const bills = await Billing.find({
    clinic,
    paymentStatus:"PAID",
    createdAt:{
      $gte:today,
      $lt:tomorrow
    }
  });

  return bills.reduce((sum,b)=>sum+b.total,0);

};
export const getMonthlyRevenue = async (clinic)=>{

  const start=new Date();

  start.setDate(1);

  start.setHours(0,0,0,0);

  const bills=await Billing.find({
    clinic,
    paymentStatus:"PAID",
    createdAt:{
      $gte:start
    }
  });

  return bills.reduce((sum,b)=>sum+b.total,0);

};
export const getPatientReport = async (clinic)=>{

  const totalPatients=await Patient.countDocuments({
    clinic
  });

  const recentPatients=await Patient.find({
    clinic
  })
  .sort({createdAt:-1})
  .limit(10);

  return{
    totalPatients,
    recentPatients
  };

};

export const getAppointmentReport = async (clinic)=>{

  const totalAppointments=
    await Appointment.countDocuments({
      clinic
    });

  const completed=
    await Appointment.countDocuments({
      clinic,
      status:"COMPLETED"
    });

  const cancelled=
    await Appointment.countDocuments({
      clinic,
      status:"CANCELLED"
    });

  return{
    totalAppointments,
    completed,
    cancelled
  };

};

export const getInventoryReport=async(clinic)=>{

  const totalMedicines=
    await Medicine.countDocuments({
      clinic
    });

  const lowStock=
    await Medicine.countDocuments({
      clinic,
      $expr:{
        $lte:[
          "$currentStock",
          "$minimumStock"
        ]
      }
    });

  return{
    totalMedicines,
    lowStock
  };

};

export const getDoctorReport=async(clinic)=>{

  const report=await Consultation.aggregate([

    {
      $match:{
        clinic
      }
    },

    {
      $group:{
        _id:"$doctor",
        consultations:{
          $sum:1
        }
      }
    }

  ]);

  return report;

};