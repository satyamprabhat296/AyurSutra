import api from "./api";

export const getMedicines = async () => {
  const response = await api.get("/medicines");
  return response.data;
};

export const getMedicine = async (id) => {
  const response = await api.get(`/medicines/${id}`);
  return response.data;
};

export const createMedicine = async (medicineData) => {
  const response = await api.post(
    "/medicines",
    medicineData
  );

  return response.data;
};

export const updateMedicine = async (
  id,
  medicineData
) => {
  const response = await api.put(
    `/medicines/${id}`,
    medicineData
  );

  return response.data;
};

export const deleteMedicine = async (id) => {
  const response = await api.delete(
    `/medicines/${id}`
  );

  return response.data;
};