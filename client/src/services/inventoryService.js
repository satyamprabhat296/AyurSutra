import api from "./api";

/**
 * Get inventory transaction history
 */
export const getInventoryHistory = async () => {
  const response = await api.get("/inventory");

  return response.data;
};

/**
 * Create inventory transaction
 */
export const createInventoryTransaction = async (
  transactionData
) => {
  const response = await api.post(
    "/inventory",
    transactionData
  );

  return response.data;
};