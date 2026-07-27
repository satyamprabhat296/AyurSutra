import Appointment from "../models/appointment.model.js";

export const generateAppointmentNumber = async () => {
  const year = new Date().getFullYear();

  const last = await Appointment.findOne()
    .sort({ createdAt: -1 })
    .select("appointmentNumber");

  let sequence = 1;

  if (last) {
    sequence =
      Number(last.appointmentNumber.split("-")[2]) + 1;
  }

  return `APT-${year}-${String(sequence).padStart(6, "0")}`;
};

export const generateToken = async (doctorId, date) => {

  const count = await Appointment.countDocuments({
    doctor: doctorId,
    appointmentDate: date,
  });

  return count + 1;
};