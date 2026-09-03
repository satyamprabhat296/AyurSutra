import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  FileText,
  X,
  Trash2,
  Pill,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import {
  getPrescriptions,
  createPrescription,
  dispensePrescription,
} from "../../services/prescriptionService";

import { getMedicines } from "../../services/medicineService";
import { getPatients } from "../../services/patientService";

const emptyMedicine = {
  medicine: "",
  dosage: "",
  frequency: "",
  duration: "",
  quantity: 1,
  instructions: "",
};

const statusStyles = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PARTIALLY_ISSUED: "bg-blue-50 text-blue-700 border-blue-200",
  ISSUED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    patient: "",
    doctor: "",
    consultation: "",
    appointment: "",
    diagnosis: "",
    advice: "",
    followUpDate: "",
    medicines: [{ ...emptyMedicine }],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [prescriptionRes, medicineRes, patientRes] =
        await Promise.all([
          getPrescriptions(),
          getMedicines(),
          getPatients(),
        ]);

      setPrescriptions(
        prescriptionRes?.prescriptions ||
          prescriptionRes?.data ||
          []
      );

      setMedicines(
        medicineRes?.medicines ||
          medicineRes?.data ||
          []
      );

      setPatients(
        patientRes?.patients ||
          patientRes?.data ||
          []
      );
    } catch (err) {
      console.error("Failed to load prescription data:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load prescription data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((prescription) => {
      const patientName =
        prescription.patient?.basicInfo?.firstName ||
        prescription.patient?.name ||
        "";

      const patientLastName =
        prescription.patient?.basicInfo?.lastName || "";

      const prescriptionNumber =
        prescription.prescriptionNumber || "";

      const query =
        `${patientName} ${patientLastName} ${prescriptionNumber}`
          .toLowerCase();

      const matchesSearch = query.includes(
        search.toLowerCase()
      );

      const matchesStatus =
        statusFilter === "ALL" ||
        prescription.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [prescriptions, search, statusFilter]);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    setForm((prev) => {
      const medicinesCopy = [...prev.medicines];

      medicinesCopy[index] = {
        ...medicinesCopy[index],
        [field]: value,
      };

      return {
        ...prev,
        medicines: medicinesCopy,
      };
    });
  };

  const addMedicine = () => {
    setForm((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        { ...emptyMedicine },
      ],
    }));
  };

  const removeMedicine = (index) => {
    setForm((prev) => {
      if (prev.medicines.length === 1) {
        return prev;
      }

      return {
        ...prev,
        medicines: prev.medicines.filter(
          (_, i) => i !== index
        ),
      };
    });
  };

  const resetForm = () => {
    setForm({
      patient: "",
      doctor: "",
      consultation: "",
      appointment: "",
      diagnosis: "",
      advice: "",
      followUpDate: "",
      medicines: [{ ...emptyMedicine }],
    });
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        patient: form.patient,
        doctor: form.doctor,
        diagnosis: form.diagnosis,
        advice: form.advice,
        followUpDate: form.followUpDate || undefined,
        medicines: form.medicines.map((medicine) => ({
          medicine: medicine.medicine,
          dosage: medicine.dosage,
          frequency: medicine.frequency,
          duration: medicine.duration,
          quantity: Number(medicine.quantity),
          instructions: medicine.instructions,
        })),
      };

      if (form.consultation) {
        payload.consultation = form.consultation;
      }

      if (form.appointment) {
        payload.appointment = form.appointment;
      }

      await createPrescription(payload);

      setSuccess("Prescription created successfully.");

      setShowCreateModal(false);
      resetForm();

      await loadData();
    } catch (err) {
      console.error("Create prescription error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to create prescription"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDispense = async (
    prescription,
    medicineItem
  ) => {
    try {
      setError("");
      setSuccess("");

      const remaining =
        Number(medicineItem.quantity || 0) -
        Number(medicineItem.issuedQuantity || 0);

      if (remaining <= 0) {
        setError("This medicine has already been fully dispensed.");
        return;
      }

      const quantityInput = window.prompt(
        `Enter quantity to dispense (remaining: ${remaining})`,
        String(remaining)
      );

      if (quantityInput === null) {
        return;
      }

      const quantity = Number(quantityInput);

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        setError("Please enter a valid quantity.");
        return;
      }

      if (quantity > remaining) {
        setError(
          `Only ${remaining} unit(s) remain to be dispensed.`
        );
        return;
      }

      await dispensePrescription(
        prescription._id,
        medicineItem.medicine?._id || medicineItem.medicine,
        quantity
      );

      setSuccess("Medicine dispensed successfully.");

      await loadData();

      const refreshed = prescriptions.find(
        (item) => item._id === prescription._id
      );

      if (refreshed) {
        setSelectedPrescription(refreshed);
      }
    } catch (err) {
      console.error("Dispense error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to dispense medicine"
      );
    }
  };

  const getPatientName = (patient) => {
    if (!patient) return "Unknown Patient";

    if (patient.basicInfo) {
      return [
        patient.basicInfo.firstName,
        patient.basicInfo.lastName,
      ]
        .filter(Boolean)
        .join(" ");
    }

    return patient.name || "Unknown Patient";
  };

  const getMedicineName = (medicine) => {
    if (!medicine) return "Unknown Medicine";

    if (typeof medicine === "string") {
      return medicine;
    }

    return (
      medicine.medicineName ||
      medicine.name ||
      "Unknown Medicine"
    );
  };

  const getDoctorName = (doctor) => {
    if (!doctor) return "Not specified";

    return (
      doctor.name ||
      doctor.staffId ||
      doctor.fullName ||
      "Doctor"
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#123c35] p-3 text-white shadow-sm">
              <FileText size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Prescriptions
              </h1>

              <p className="text-sm text-slate-500">
                Manage prescriptions and medicine dispensing
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setError("");
            setSuccess("");
            resetForm();
            setShowCreateModal(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#123c35] px-5 py-3 font-medium text-white shadow-sm transition hover:bg-[#0d302a]"
        >
          <Plus size={19} />
          New Prescription
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} />
          <span>{error}</span>

          <button
            onClick={() => setError("")}
            className="ml-auto"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle size={18} />
          <span>{success}</span>

          <button
            onClick={() => setSuccess("")}
            className="ml-auto"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total"
          value={prescriptions.length}
          icon={<FileText size={20} />}
        />

        <StatCard
          title="Pending"
          value={
            prescriptions.filter(
              (p) => p.status === "PENDING"
            ).length
          }
          icon={<Clock size={20} />}
        />

        <StatCard
          title="Partially Issued"
          value={
            prescriptions.filter(
              (p) => p.status === "PARTIALLY_ISSUED"
            ).length
          }
          icon={<Pill size={20} />}
        />

        <StatCard
          title="Issued"
          value={
            prescriptions.filter(
              (p) => p.status === "ISSUED"
            ).length
          }
          icon={<CheckCircle size={20} />}
        />
      </div>

      {/* Filters */}
      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search prescription or patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#123c35] focus:ring-2 focus:ring-[#123c35]/10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#123c35]"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PARTIALLY_ISSUED">
              Partially Issued
            </option>
            <option value="ISSUED">Issued</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button
            onClick={loadData}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>
      </div>

      {/* Prescription List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-slate-500">
              <RefreshCw
                size={20}
                className="animate-spin"
              />
              Loading prescriptions...
            </div>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 rounded-full bg-slate-100 p-5">
              <FileText
                size={32}
                className="text-slate-400"
              />
            </div>

            <h3 className="text-lg font-semibold text-slate-800">
              No prescriptions found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Create a prescription to get started.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4">
                      Prescription
                    </th>

                    <th className="px-5 py-4">
                      Patient
                    </th>

                    <th className="px-5 py-4">
                      Doctor
                    </th>

                    <th className="px-5 py-4">
                      Medicines
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPrescriptions.map(
                    (prescription) => (
                      <tr
                        key={prescription._id}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {prescription.prescriptionNumber}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {prescription.createdAt
                              ? new Date(
                                  prescription.createdAt
                                ).toLocaleDateString()
                              : "-"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-800">
                            {getPatientName(
                              prescription.patient
                            )}
                          </p>

                          <p className="text-xs text-slate-400">
                            {prescription.patient?.contact
                              ?.phone || ""}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {getDoctorName(
                            prescription.doctor
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700">
                            <Pill size={14} />
                            {prescription.medicines
                              ?.length || 0}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={prescription.status}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() =>
                              setSelectedPrescription(
                                prescription
                              )
                            }
                            className="rounded-lg bg-[#123c35] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#0d302a]"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredPrescriptions.map(
                (prescription) => (
                  <div
                    key={prescription._id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {prescription.prescriptionNumber}
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                          {getPatientName(
                            prescription.patient
                          )}
                        </p>
                      </div>

                      <StatusBadge
                        status={prescription.status}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {prescription.medicines
                          ?.length || 0}{" "}
                        medicine(s)
                      </span>

                      <button
                        onClick={() =>
                          setSelectedPrescription(
                            prescription
                          )
                        }
                        className="rounded-lg bg-[#123c35] px-3 py-2 text-xs font-medium text-white"
                      >
                        View
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Create Prescription
                </h2>

                <p className="text-xs text-slate-500">
                  Add patient, diagnosis and prescribed medicines
                </p>
              </div>

              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleCreatePrescription}
              className="max-h-[calc(92vh-75px)] overflow-y-auto p-5"
            >
              {/* Patient */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Patient *">
                  <select
                    required
                    value={form.patient}
                    onChange={(e) =>
                      handleFormChange(
                        "patient",
                        e.target.value
                      )
                    }
                    className="input"
                  >
                    <option value="">
                      Select patient
                    </option>

                    {patients.map((patient) => (
                      <option
                        key={patient._id}
                        value={patient._id}
                      >
                        {getPatientName(patient)}
                        {patient.contact?.phone
                          ? ` — ${patient.contact.phone}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Doctor ID *">
                  <input
                    required
                    value={form.doctor}
                    onChange={(e) =>
                      handleFormChange(
                        "doctor",
                        e.target.value
                      )
                    }
                    placeholder="Enter doctor/staff ID"
                    className="input"
                  />
                </FormField>

                <FormField label="Consultation ID">
                  <input
                    value={form.consultation}
                    onChange={(e) =>
                      handleFormChange(
                        "consultation",
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                    className="input"
                  />
                </FormField>

                <FormField label="Appointment ID">
                  <input
                    value={form.appointment}
                    onChange={(e) =>
                      handleFormChange(
                        "appointment",
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                    className="input"
                  />
                </FormField>

                <FormField label="Diagnosis">
                  <textarea
                    value={form.diagnosis}
                    onChange={(e) =>
                      handleFormChange(
                        "diagnosis",
                        e.target.value
                      )
                    }
                    rows={3}
                    placeholder="Diagnosis / clinical findings"
                    className="input resize-none"
                  />
                </FormField>

                <FormField label="Advice">
                  <textarea
                    value={form.advice}
                    onChange={(e) =>
                      handleFormChange(
                        "advice",
                        e.target.value
                      )
                    }
                    rows={3}
                    placeholder="Diet, lifestyle or other advice"
                    className="input resize-none"
                  />
                </FormField>

                <FormField label="Follow-up Date">
                  <input
                    type="date"
                    value={form.followUpDate}
                    onChange={(e) =>
                      handleFormChange(
                        "followUpDate",
                        e.target.value
                      )
                    }
                    className="input"
                  />
                </FormField>
              </div>

              {/* Medicines */}
              <div className="mt-7">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Prescribed Medicines
                    </h3>

                    <p className="text-xs text-slate-500">
                      Add each medicine with dosage and duration.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addMedicine}
                    className="flex items-center gap-1.5 rounded-lg border border-[#123c35] px-3 py-2 text-xs font-medium text-[#123c35] hover:bg-[#123c35] hover:text-white"
                  >
                    <Plus size={15} />
                    Add Medicine
                  </button>
                </div>

                <div className="space-y-4">
                  {form.medicines.map(
                    (medicine, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-700">
                            Medicine #{index + 1}
                          </span>

                          {form.medicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeMedicine(index)
                              }
                              className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                          <FormField label="Medicine *">
                            <select
                              required
                              value={medicine.medicine}
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  "medicine",
                                  e.target.value
                                )
                              }
                              className="input"
                            >
                              <option value="">
                                Select medicine
                              </option>

                              {medicines.map(
                                (item) => (
                                  <option
                                    key={item._id}
                                    value={item._id}
                                  >
                                    {item.medicineName}
                                    {" — Stock: "}
                                    {item.currentStock ??
                                      0}
                                  </option>
                                )
                              )}
                            </select>
                          </FormField>

                          <FormField label="Dosage *">
                            <input
                              required
                              value={medicine.dosage}
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  "dosage",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. 1 tablet"
                              className="input"
                            />
                          </FormField>

                          <FormField label="Frequency *">
                            <input
                              required
                              value={medicine.frequency}
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  "frequency",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. 1-0-1"
                              className="input"
                            />
                          </FormField>

                          <FormField label="Duration *">
                            <input
                              required
                              value={medicine.duration}
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  "duration",
                                  e.target.value
                                )
                              }
                              placeholder="e.g. 7 days"
                              className="input"
                            />
                          </FormField>

                          <FormField label="Quantity *">
                            <input
                              required
                              min="1"
                              type="number"
                              value={medicine.quantity}
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              className="input"
                            />
                          </FormField>

                          <FormField label="Instructions">
                            <input
                              value={
                                medicine.instructions
                              }
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  "instructions",
                                  e.target.value
                                )
                              }
                              placeholder="After food"
                              className="input"
                            />
                          </FormField>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="mt-7 flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-[#123c35] px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  Create Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="font-bold text-slate-900">
                  {selectedPrescription.prescriptionNumber}
                </h2>

                <p className="text-xs text-slate-500">
                  Prescription details
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedPrescription(null)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[calc(90vh-75px)] overflow-y-auto p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <InfoCard
                  label="Patient"
                  value={getPatientName(
                    selectedPrescription.patient
                  )}
                />

                <InfoCard
                  label="Doctor"
                  value={getDoctorName(
                    selectedPrescription.doctor
                  )}
                />

                <InfoCard
                  label="Status"
                  value={
                    <StatusBadge
                      status={selectedPrescription.status}
                    />
                  }
                />
              </div>

              {selectedPrescription.diagnosis && (
                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Diagnosis
                  </p>

                  <p className="text-sm text-slate-700">
                    {selectedPrescription.diagnosis}
                  </p>
                </div>
              )}

              <div className="mt-6">
                <div className="mb-3 flex items-center gap-2">
                  <Pill
                    size={19}
                    className="text-[#123c35]"
                  />

                  <h3 className="font-semibold text-slate-900">
                    Medicines
                  </h3>
                </div>

                <div className="space-y-3">
                  {selectedPrescription.medicines?.map(
                    (item, index) => {
                      const remaining =
                        Number(item.quantity || 0) -
                        Number(
                          item.issuedQuantity || 0
                        );

                      return (
                        <div
                          key={item._id || index}
                          className="rounded-xl border border-slate-200 p-4"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                              <h4 className="font-semibold text-slate-800">
                                {getMedicineName(
                                  item.medicine
                                )}
                              </h4>

                              <div className="mt-2 grid grid-cols-2 gap-x-5 gap-y-1 text-xs text-slate-500">
                                <span>
                                  Dosage:{" "}
                                  <b className="text-slate-700">
                                    {item.dosage}
                                  </b>
                                </span>

                                <span>
                                  Frequency:{" "}
                                  <b className="text-slate-700">
                                    {item.frequency}
                                  </b>
                                </span>

                                <span>
                                  Duration:{" "}
                                  <b className="text-slate-700">
                                    {item.duration}
                                  </b>
                                </span>

                                <span>
                                  Quantity:{" "}
                                  <b className="text-slate-700">
                                    {item.quantity}
                                  </b>
                                </span>
                              </div>

                              {item.instructions && (
                                <p className="mt-2 text-xs text-slate-500">
                                  Instructions:{" "}
                                  {item.instructions}
                                </p>
                              )}

                              <p className="mt-2 text-xs">
                                <span className="text-slate-500">
                                  Issued:
                                </span>{" "}
                                <b className="text-emerald-700">
                                  {item.issuedQuantity || 0}
                                </b>

                                <span className="mx-2 text-slate-300">
                                  |
                                </span>

                                <span className="text-slate-500">
                                  Remaining:
                                </span>{" "}
                                <b className="text-slate-700">
                                  {remaining}
                                </b>
                              </p>
                            </div>

                            {remaining > 0 &&
                              selectedPrescription.status !==
                                "CANCELLED" && (
                                <button
                                  onClick={() =>
                                    handleDispense(
                                      selectedPrescription,
                                      item
                                    )
                                  }
                                  className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#123c35] px-3 py-2 text-xs font-medium text-white hover:bg-[#0d302a]"
                                >
                                  <Pill size={15} />
                                  Dispense
                                </button>
                              )}

                            {remaining <= 0 && (
                              <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                                <CheckCircle size={15} />
                                Fully Dispensed
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {selectedPrescription.advice && (
                <div className="mt-5 rounded-xl bg-emerald-50 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Advice
                  </p>

                  <p className="text-sm text-slate-700">
                    {selectedPrescription.advice}
                  </p>
                </div>
              )}

              {selectedPrescription.followUpDate && (
                <div className="mt-4 rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-400">
                    Follow-up
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {new Date(
                      selectedPrescription.followUpDate
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-2xl font-bold text-slate-900">
          {value}
        </p>
      </div>

      <div className="rounded-xl bg-slate-100 p-3 text-[#123c35]">
        {icon}
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
      statusStyles[status] ||
      "border-slate-200 bg-slate-50 text-slate-600"
    }`}
  >
    {status?.replaceAll("_", " ") || "UNKNOWN"}
  </span>
);

const FormField = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-medium text-slate-600">
      {label}
    </label>

    {children}
  </div>
);

const InfoCard = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <p className="text-xs text-slate-400">
      {label}
    </p>

    <div className="mt-1 text-sm font-semibold text-slate-800">
      {value}
    </div>
  </div>
);

export default Prescriptions;
