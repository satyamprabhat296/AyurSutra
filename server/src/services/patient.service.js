import Patient from "../models/patient.model.js";

/**
 * Generate Unique Patient ID
 * Format: AYU-2026-000001
 */
export const generatePatientId = async () => {
  const year = new Date().getFullYear();

  const prefix = `AYU-${year}-`;

  const lastPatient = await Patient.findOne({
    patientId: {
      $regex: `^${prefix}`,
    },
  })
    .sort({ patientId: -1 })
    .select("patientId");

  let sequence = 1;

  if (lastPatient?.patientId) {
    const parts = lastPatient.patientId.split("-");

    const lastSequence = Number(parts[2]);

    if (!Number.isNaN(lastSequence)) {
      sequence = lastSequence + 1;
    }
  }

  return `${prefix}${String(sequence).padStart(6, "0")}`;
};

/**
 * Register Patient
 */
export const createPatient = async (patientData) => {
  return await Patient.create(patientData);
};

/**
 * Get Patient by ID
 * Clinic restricted
 */
export const getPatientById = async (id, clinic) => {
  return await Patient.findOne({
    _id: id,
    clinic,
    isActive: true,
  });
};

/**
 * Update Patient
 * Clinic restricted
 */
export const updatePatientById = async (
  id,
  clinic,
  data
) => {
  return await Patient.findOneAndUpdate(
    {
      _id: id,
      clinic,
      isActive: true,
    },
    data,
    {
      new: true,
      runValidators: true,
    }
  );
};

/**
 * Soft Delete Patient
 * Clinic restricted
 */
export const deletePatientById = async (
  id,
  clinic
) => {
  return await Patient.findOneAndUpdate(
    {
      _id: id,
      clinic,
      isActive: true,
    },
    {
      isActive: false,
    },
    {
      new: true,
    }
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
  page = Math.max(1, Number(page) || 1);
  limit = Math.min(
    100,
    Math.max(1, Number(limit) || 10)
  );

  const query = {
    clinic,
    isActive: true,
  };

  if (search.trim()) {
    const searchRegex = {
      $regex: search.trim(),
      $options: "i",
    };

    query.$or = [
      {
        patientId: searchRegex,
      },
      {
        "basicInfo.firstName": searchRegex,
      },
      {
        "basicInfo.lastName": searchRegex,
      },
      {
        "contact.phone": searchRegex,
      },
      {
        "contact.email": searchRegex,
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
    limit,
    totalPages: Math.ceil(total / limit),
  };
};