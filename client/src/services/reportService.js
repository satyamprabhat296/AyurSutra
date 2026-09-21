import api from "./api";

// ==========================================
// SUMMARY
// ==========================================
export const getReportSummary = async (from, to) => {
  const response = await api.get("/reports/summary", {
    params: {
      from,
      to,
    },
  });

  return response.data;
};

// ==========================================
// REVENUE
// ==========================================
export const getRevenueReport = async (from, to) => {
  const response = await api.get("/reports/revenue", {
    params: {
      from,
      to,
    },
  });

  return response.data;
};

// ==========================================
// APPOINTMENTS
// ==========================================
export const getAppointmentReport = async (from, to) => {
  const response = await api.get("/reports/appointments", {
    params: {
      from,
      to,
    },
  });

  return response.data;
};

// ==========================================
// PHARMACY
// ==========================================
export const getPharmacyReport = async (from, to) => {
  const response = await api.get("/reports/pharmacy", {
    params: {
      from,
      to,
    },
  });

  return response.data;
};