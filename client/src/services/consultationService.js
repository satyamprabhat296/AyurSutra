import api from "./api";

/**
 * Get all consultations
 */
export const getConsultations = async () => {
  const response = await api.get("/consultations");

  return response.data;
};


/**
 * Get single consultation
 */
export const getConsultation = async (id) => {
  const response = await api.get(
    `/consultations/${id}`
  );

  return response.data;
};


/**
 * Create consultation
 */
export const createConsultation = async (
  consultationData
) => {
  const response = await api.post(
    "/consultations",
    consultationData
  );

  return response.data;
};


/**
 * Update consultation
 */
export const updateConsultation = async (
  id,
  consultationData
) => {
  const response = await api.put(
    `/consultations/${id}`,
    consultationData
  );

  return response.data;
};