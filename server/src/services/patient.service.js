import Patient from "../models/patient.model.js";

/**
 * Generate Unique Patient ID
 * Format: AYU-2026-000001
 */
export const generatePatientId = async () => {
  const year = new Date().getFullYear();

  const lastPatient = await Patient.findOne()
    .sort({ createdAt: -1 })
    .select("patientId");

  let sequence = 1;

  if (lastPatient) {
    const parts = lastPatient.patientId.split("-");
    sequence = Number(parts[2]) + 1;
  }

  return `AYU-${year}-${String(sequence).padStart(6, "0")}`;
};

/**
 * Register Patient
 */
export const createPatient = async (patientData) => {
  return await Patient.create(patientData);
};

/**
 * Get Patient by ID
 */
export const getPatientById = async (id) => {
  return await Patient.findById(id);
};

/**
 * Update Patient
 */
export const updatePatientById = async (id, data) => {
  return await Patient.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

/**
 * Soft Delete Patient
 */
export const deletePatientById = async (id) => {
  return await Patient.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
};

/**
 * Search & Pagination
 */
export const getPatients = async ({
  clinic,
  page = 1,
  limit = 10,
  search = "",
}) => {
  const query = {
    clinic,
    isActive: true,
  };

  if (search) {
    query.$or = [
      {
        patientId: {
          $regex: search,
          $options: "i",
        },
      },
      {
        "basicInfo.firstName": {
          $regex: search,
          $options: "i",
        },
      },
      {
        "basicInfo.lastName": {
          $regex: search,
          $options: "i",
        },
      },
      {
        "contact.phone": {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const patients = await Patient.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Patient.countDocuments(query);

  return {
    patients,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};