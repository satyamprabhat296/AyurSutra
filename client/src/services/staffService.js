import api from "./api";

export const getStaff = async () => {
  const response = await api.get("/staff");

  return response.data;
}; 