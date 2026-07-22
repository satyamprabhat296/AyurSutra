import Staff from "../models/staff.model.js";

export const generateStaffId = async () => {
  const year = new Date().getFullYear();

  const last = await Staff.findOne()
    .sort({ createdAt: -1 })
    .select("staffId");

  let sequence = 1;

  if (last) {
    sequence = Number(last.staffId.split("-")[2]) + 1;
  }

  return `STF-${year}-${String(sequence).padStart(6, "0")}`;
};

export const createStaff = async (data) => {
  return await Staff.create(data);
};

export const getAllStaff = async (clinic) => {
  return await Staff.find({
    clinic,
    isActive: true,
  }).sort({ createdAt: -1 });
};

export const getStaffById = async (id) => {
  return await Staff.findById(id);
};

export const updateStaff = async (id, data) => {
  return await Staff.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const deleteStaff = async (id) => {
  return await Staff.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
};