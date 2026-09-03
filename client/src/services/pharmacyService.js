import api from "./api";

export const getPharmacyPrescriptions = async () => {
  const response = await api.get("/prescriptions");
  return response.data;
};

export const getPharmacyMedicines = async () => {
  const response = await api.get("/medicines");
  return response.data;
};

export const issuePrescription = async (prescriptionId) => {
  const response = await api.post(
    `/pharmacy/prescriptions/${prescriptionId}/issue`
  );

  return response.data;
};