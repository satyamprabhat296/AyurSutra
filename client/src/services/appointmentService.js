import api from "./api";

export const getAppointments = async () => {
  const response = await api.get("/appointments");
  return response.data;
};

export const getAppointment = async (id) => {
  const response = await api.get(`/appointments/${id}`);
  return response.data;
};

export const createAppointment = async (appointmentData) => {
  const response = await api.post(
    "/appointments",
    appointmentData
  );
  return response.data;
};

export const updateAppointment = async (
  id,
  appointmentData
) => {
  const response = await api.put(
    `/appointments/${id}`,
    appointmentData
  );
  return response.data;
};

export const updateAppointmentStatus = async (
  id,
  status
) => {
  const response = await api.patch(
    `/appointments/${id}/status`,
    { status }
  );
  return response.data;
};

export const cancelAppointment = async (id) => {
  const response = await api.delete(
    `/appointments/${id}`
  );
  return response.data;
};