import api from "./api";

// Get all bills
export const getBills = async () => {
  const response = await api.get("/billing");
  return response.data;
};

// Get single bill
export const getBill = async (id) => {
  const response = await api.get(`/billing/${id}`);
  return response.data;
};

// Create bill
export const createBill = async (billData) => {
  const response = await api.post(
    "/billing",
    billData
  );

  return response.data;
};

// Mark bill as paid
export const markBillPaid = async (
  id,
  paymentMethod
) => {
  const response = await api.patch(
    `/billing/${id}/pay`,
    {
      paymentMethod,
    }
  );

  return response.data;
};

// Get bill PDF
export const getBillPDF = async (id) => {
  const response = await api.get(
    `/billing/${id}/pdf`,
    {
      responseType: "blob",
    }
  );

  return response;
};