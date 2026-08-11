import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Eye,
  Loader2,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from "../services/patientService";

const initialForm = {
  registrationType: "OPD",

  basicInfo: {
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    age: "",
    bloodGroup: "",
    maritalStatus: "",
    occupation: "",
  },

  contact: {
    phone: "",
    alternatePhone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  },

  emergencyContact: {
    name: "",
    relation: "",
    phone: "",
  },
};

const getPatientName = (patient) => {
  return [
    patient?.basicInfo?.firstName,
    patient?.basicInfo?.lastName,
  ]
    .filter(Boolean)
    .join(" ");
};

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [editingPatient, setEditingPatient] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [form, setForm] = useState(initialForm);

  // =========================
  // LOAD PATIENTS
  // =========================

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPatients();

      setPatients(data?.patients || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load patients."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // =========================
  // SEARCH
  // =========================

  const filteredPatients = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return patients;

    return patients.filter((patient) => {
      const fullName = getPatientName(patient);

      return [
        fullName,
        patient.patientId,
        patient.basicInfo?.gender,
        patient.contact?.phone,
        patient.contact?.email,
      ]
        .filter(Boolean)
        .some((field) =>
          String(field)
            .toLowerCase()
            .includes(value)
        );
    });
  }, [patients, search]);

  // =========================
  // OPEN CREATE MODAL
  // =========================

  const openCreateModal = () => {
    setEditingPatient(null);
    setForm(initialForm);
    setError("");
    setModalOpen(true);
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================

  const openEditModal = (patient) => {
    setEditingPatient(patient);

    setForm({
      registrationType:
        patient.registrationType || "OPD",

      basicInfo: {
        firstName:
          patient.basicInfo?.firstName || "",

        lastName:
          patient.basicInfo?.lastName || "",

        gender:
          patient.basicInfo?.gender || "",

        dob: patient.basicInfo?.dob
          ? new Date(patient.basicInfo.dob)
              .toISOString()
              .split("T")[0]
          : "",

        age:
          patient.basicInfo?.age || "",

        bloodGroup:
          patient.basicInfo?.bloodGroup || "",

        maritalStatus:
          patient.basicInfo?.maritalStatus || "",

        occupation:
          patient.basicInfo?.occupation || "",
      },

      contact: {
        phone:
          patient.contact?.phone || "",

        alternatePhone:
          patient.contact?.alternatePhone || "",

        email:
          patient.contact?.email || "",

        address:
          patient.contact?.address || "",

        city:
          patient.contact?.city || "",

        state:
          patient.contact?.state || "",

        pincode:
          patient.contact?.pincode || "",
      },

      emergencyContact: {
        name:
          patient.emergencyContact?.name || "",

        relation:
          patient.emergencyContact?.relation || "",

        phone:
          patient.emergencyContact?.phone || "",
      },
    });

    setError("");
    setModalOpen(true);
  };

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (section, field, value) => {
    setForm((previous) => ({
      ...previous,

      [section]: {
        ...previous[section],
        [field]: value,
      },
    }));
  };

  const handleTopLevelChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        ...form,

        basicInfo: {
          ...form.basicInfo,

          age: form.basicInfo.age
            ? Number(form.basicInfo.age)
            : undefined,
        },
      };

      if (editingPatient) {
        await updatePatient(
          editingPatient._id,
          payload
        );

        setSuccess(
          "Patient updated successfully."
        );
      } else {
        await createPatient(payload);

        setSuccess(
          "Patient registered successfully."
        );
      }

      setModalOpen(false);
      setEditingPatient(null);
      setForm(initialForm);

      await loadPatients();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save patient."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (patient) => {
    const name =
      getPatientName(patient) || "this patient";

    const confirmed = window.confirm(
      `Delete ${name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deletePatient(patient._id);

      setPatients((previous) =>
        previous.filter(
          (item) => item._id !== patient._id
        )
      );

      setSuccess(
        "Patient deleted successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete patient."
      );
    }
  };

  // =========================
  // VIEW
  // =========================

  const openViewModal = (patient) => {
    setSelectedPatient(patient);
    setViewOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

        <div>
          <p className="text-sm font-semibold text-emerald-700">
            Clinic Management
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
            Patients
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Register and manage Panchakarma patient records.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#123c35] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d302a]"
        >
          <Plus size={18} />
          Register Patient
        </button>
      </div>

      {/* ALERTS */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-3">

        <StatCard
          icon={Users}
          label="Total Patients"
          value={patients.length}
        />

        <StatCard
          icon={Search}
          label="Search Results"
          value={filteredPatients.length}
        />

        <StatCard
          icon={Users}
          label="Registration Type"
          value="OPD / IPD"
        />

      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {/* SEARCH */}

        <div className="border-b border-gray-100 p-5">

          <div className="relative max-w-md">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search name, patient ID, phone..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />

          </div>
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="flex min-h-72 items-center justify-center">

            <div className="flex flex-col items-center gap-3">

              <Loader2
                size={30}
                className="animate-spin text-emerald-700"
              />

              <p className="text-sm text-gray-500">
                Loading patients...
              </p>

            </div>

          </div>
        ) : filteredPatients.length === 0 ? (

          /* EMPTY */

          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Users size={25} />
            </div>

            <h3 className="mt-4 font-semibold text-gray-900">
              No patients found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Register your first patient or try another search.
            </p>

          </div>

        ) : (

          /* TABLE */

          <div className="overflow-x-auto">

            <table className="w-full min-w-[950px] text-left">

              <thead>

                <tr className="border-b border-gray-100 bg-gray-50/70 text-xs uppercase tracking-wide text-gray-400">

                  <th className="px-6 py-4 font-semibold">
                    Patient
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Patient ID
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Type
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Gender
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Phone
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredPatients.map(
                  (patient) => {

                    const name =
                      getPatientName(patient);

                    return (
                      <tr
                        key={patient._id}
                        className="border-b border-gray-50 transition last:border-0 hover:bg-gray-50/70"
                      >

                        {/* PATIENT */}

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 font-bold text-emerald-700">
                              {patient.basicInfo?.firstName
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "P"}
                            </div>

                            <div>

                              <p className="text-sm font-semibold text-gray-800">
                                {name || "Unnamed Patient"}
                              </p>

                              <p className="text-xs text-gray-400">
                                {patient.contact?.email ||
                                  "No email"}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* PATIENT ID */}

                        <td className="px-6 py-4 text-sm font-medium text-gray-600">
                          {patient.patientId || "—"}
                        </td>

                        {/* REGISTRATION */}

                        <td className="px-6 py-4">

                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            {patient.registrationType ||
                              "OPD"}
                          </span>

                        </td>

                        {/* GENDER */}

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {patient.basicInfo?.gender ||
                            "—"}
                        </td>

                        {/* PHONE */}

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {patient.contact?.phone ||
                            "—"}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-1">

                            <ActionButton
                              title="View"
                              onClick={() =>
                                openViewModal(patient)
                              }
                            >
                              <Eye size={17} />
                            </ActionButton>

                            <ActionButton
                              title="Edit"
                              onClick={() =>
                                openEditModal(patient)
                              }
                            >
                              <Edit3 size={16} />
                            </ActionButton>

                            <ActionButton
                              title="Delete"
                              danger
                              onClick={() =>
                                handleDelete(patient)
                              }
                            >
                              <Trash2 size={16} />
                            </ActionButton>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}

      {modalOpen && (
        <PatientModal
          editing={editingPatient}
          form={form}
          saving={saving}
          onChange={handleChange}
          onTopLevelChange={handleTopLevelChange}
          onSubmit={handleSubmit}
          onClose={() => {
            setModalOpen(false);
            setEditingPatient(null);
          }}
        />
      )}

      {/* VIEW MODAL */}

      {viewOpen && selectedPatient && (
        <ViewPatientModal
          patient={selectedPatient}
          onClose={() => {
            setViewOpen(false);
            setSelectedPatient(null);
          }}
        />
      )}

    </div>
  );
};

/* =====================================================
   STAT CARD
===================================================== */

const StatCard = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

    <div className="flex items-center justify-between">

      <div>

        <p className="text-sm text-gray-500">
          {label}
        </p>

        <p className="mt-2 text-2xl font-bold text-gray-900">
          {value}
        </p>

      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon size={20} />
      </div>

    </div>

  </div>
);

/* =====================================================
   ACTION BUTTON
===================================================== */

const ActionButton = ({
  children,
  title,
  onClick,
  danger = false,
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`rounded-lg p-2 transition ${
      danger
        ? "text-gray-400 hover:bg-red-50 hover:text-red-600"
        : "text-gray-400 hover:bg-emerald-50 hover:text-emerald-700"
    }`}
  >
    {children}
  </button>
);

/* =====================================================
   PATIENT MODAL
===================================================== */

const PatientModal = ({
  editing,
  form,
  saving,
  onChange,
  onTopLevelChange,
  onSubmit,
  onClose,
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

    <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

      {/* HEADER */}

      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">

        <div>

          <h2 className="text-xl font-bold text-gray-900">
            {editing
              ? "Edit Patient"
              : "Register Patient"}
          </h2>

          <p className="mt-1 text-xs text-gray-400">
            Enter complete patient information.
          </p>

        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
        >
          <X size={20} />
        </button>

      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-7 p-6"
      >

        {/* REGISTRATION */}

        <Section title="Registration">

          <div className="grid gap-5 sm:grid-cols-2">

            <Select
              label="Registration Type"
              value={form.registrationType}
              onChange={(e) =>
                onTopLevelChange(
                  "registrationType",
                  e.target.value
                )
              }
              options={[
                {
                  value: "OPD",
                  label: "OPD",
                },
                {
                  value: "IPD",
                  label: "IPD",
                },
              ]}
            />

          </div>

        </Section>

        {/* BASIC INFORMATION */}

        <Section title="Basic Information">

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            <Input
              label="First Name"
              required
              value={form.basicInfo.firstName}
              onChange={(e) =>
                onChange(
                  "basicInfo",
                  "firstName",
                  e.target.value
                )
              }
            />

            <Input
              label="Last Name"
              value={form.basicInfo.lastName}
              onChange={(e) =>
                onChange(
                  "basicInfo",
                  "lastName",
                  e.target.value
                )
              }
            />

            <Select
              label="Gender"
              required
              value={form.basicInfo.gender}
              onChange={(e) =>
                onChange(
                  "basicInfo",
                  "gender",
                  e.target.value
                )
              }
              options={[
                {
                  value: "Male",
                  label: "Male",
                },
                {
                  value: "Female",
                  label: "Female",
                },
                {
                  value: "Other",
                  label: "Other",
                },
              ]}
            />

            <Input
              label="Date of Birth"
              type="date"
              value={form.basicInfo.dob}
              onChange={(e) =>
                onChange(
                  "basicInfo",
                  "dob",
                  e.target.value
                )
              }
            />

            <Input
              label="Age"
              type="number"
              min="0"
              value={form.basicInfo.age}
              onChange={(e) =>
                onChange(
                  "basicInfo",
                  "age",
                  e.target.value
                )
              }
            />

            <Input
              label="Blood Group"
              placeholder="e.g. B+"
              value={form.basicInfo.bloodGroup}
              onChange={(e) =>
                onChange(
                  "basicInfo",
                  "bloodGroup",
                  e.target.value
                )
              }
            />

            <Input
              label="Marital Status"
              value={form.basicInfo.maritalStatus}
              onChange={(e) =>
                onChange(
                  "basicInfo",
                  "maritalStatus",
                  e.target.value
                )
              }
            />

            <Input
              label="Occupation"
              value={form.basicInfo.occupation}
              onChange={(e) =>
                onChange(
                  "basicInfo",
                  "occupation",
                  e.target.value
                )
              }
            />

          </div>

        </Section>

        {/* CONTACT */}

        <Section title="Contact Information">

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            <Input
              label="Phone"
              required
              value={form.contact.phone}
              onChange={(e) =>
                onChange(
                  "contact",
                  "phone",
                  e.target.value
                )
              }
            />

            <Input
              label="Alternate Phone"
              value={form.contact.alternatePhone}
              onChange={(e) =>
                onChange(
                  "contact",
                  "alternatePhone",
                  e.target.value
                )
              }
            />

            <Input
              label="Email"
              type="email"
              value={form.contact.email}
              onChange={(e) =>
                onChange(
                  "contact",
                  "email",
                  e.target.value
                )
              }
            />

            <Input
              label="City"
              value={form.contact.city}
              onChange={(e) =>
                onChange(
                  "contact",
                  "city",
                  e.target.value
                )
              }
            />

            <Input
              label="State"
              value={form.contact.state}
              onChange={(e) =>
                onChange(
                  "contact",
                  "state",
                  e.target.value
                )
              }
            />

            <Input
              label="Pincode"
              value={form.contact.pincode}
              onChange={(e) =>
                onChange(
                  "contact",
                  "pincode",
                  e.target.value
                )
              }
            />

          </div>

          <div className="mt-5">

            <Textarea
              label="Address"
              value={form.contact.address}
              onChange={(e) =>
                onChange(
                  "contact",
                  "address",
                  e.target.value
                )
              }
            />

          </div>

        </Section>

        {/* EMERGENCY CONTACT */}

        <Section title="Emergency Contact">

          <div className="grid gap-5 sm:grid-cols-3">

            <Input
              label="Name"
              value={form.emergencyContact.name}
              onChange={(e) =>
                onChange(
                  "emergencyContact",
                  "name",
                  e.target.value
                )
              }
            />

            <Input
              label="Relation"
              placeholder="e.g. Father"
              value={form.emergencyContact.relation}
              onChange={(e) =>
                onChange(
                  "emergencyContact",
                  "relation",
                  e.target.value
                )
              }
            />

            <Input
              label="Phone"
              value={form.emergencyContact.phone}
              onChange={(e) =>
                onChange(
                  "emergencyContact",
                  "phone",
                  e.target.value
                )
              }
            />

          </div>

        </Section>

        {/* FOOTER */}

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#123c35] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d302a] disabled:cursor-not-allowed disabled:opacity-60"
          >

            {saving && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            {editing
              ? "Save Changes"
              : "Register Patient"}

          </button>

        </div>

      </form>
    </div>
  </div>
);

/* =====================================================
   VIEW PATIENT
===================================================== */

const ViewPatientModal = ({
  patient,
  onClose,
}) => {
  const name = getPatientName(patient);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">

      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-lg font-bold text-emerald-700">
              {patient.basicInfo?.firstName
                ?.charAt(0)
                ?.toUpperCase() || "P"}
            </div>

            <div>

              <h2 className="font-bold text-gray-900">
                {name || "Patient"}
              </h2>

              <p className="text-xs text-gray-400">
                {patient.patientId}
              </p>

            </div>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
          >
            <X size={20} />
          </button>

        </div>

        <div className="space-y-6 p-6">

          <Section title="Basic Information">

            <div className="grid gap-4 sm:grid-cols-3">

              <Info
                label="Gender"
                value={patient.basicInfo?.gender}
              />

              <Info
                label="Date of Birth"
                value={
                  patient.basicInfo?.dob
                    ? new Date(
                        patient.basicInfo.dob
                      ).toLocaleDateString(
                        "en-IN"
                      )
                    : "—"
                }
              />

              <Info
                label="Age"
                value={patient.basicInfo?.age}
              />

              <Info
                label="Blood Group"
                value={patient.basicInfo?.bloodGroup}
              />

              <Info
                label="Marital Status"
                value={
                  patient.basicInfo?.maritalStatus
                }
              />

              <Info
                label="Occupation"
                value={
                  patient.basicInfo?.occupation
                }
              />

            </div>

          </Section>

          <Section title="Contact Information">

            <div className="grid gap-4 sm:grid-cols-2">

              <Info
                label="Phone"
                value={patient.contact?.phone}
              />

              <Info
                label="Alternate Phone"
                value={
                  patient.contact?.alternatePhone
                }
              />

              <Info
                label="Email"
                value={patient.contact?.email}
              />

              <Info
                label="City"
                value={patient.contact?.city}
              />

              <Info
                label="State"
                value={patient.contact?.state}
              />

              <Info
                label="Pincode"
                value={patient.contact?.pincode}
              />

              <div className="sm:col-span-2">

                <Info
                  label="Address"
                  value={patient.contact?.address}
                />

              </div>

            </div>

          </Section>

          <Section title="Emergency Contact">

            <div className="grid gap-4 sm:grid-cols-3">

              <Info
                label="Name"
                value={
                  patient.emergencyContact?.name
                }
              />

              <Info
                label="Relation"
                value={
                  patient.emergencyContact?.relation
                }
              />

              <Info
                label="Phone"
                value={
                  patient.emergencyContact?.phone
                }
              />

            </div>

          </Section>

          <Section title="Medical History">

            <div className="grid gap-4 sm:grid-cols-2">

              <Info
                label="Diabetes"
                value={
                  patient.medicalHistory?.diabetes
                    ? "Yes"
                    : "No"
                }
              />

              <Info
                label="Hypertension"
                value={
                  patient.medicalHistory?.hypertension
                    ? "Yes"
                    : "No"
                }
              />

              <Info
                label="Allergies"
                value={
                  patient.medicalHistory?.allergies
                    ?.join(", ") || "None"
                }
              />

              <Info
                label="Current Medications"
                value={
                  patient.medicalHistory?.medications
                    ?.join(", ") || "None"
                }
              />

            </div>

          </Section>

        </div>

        <div className="border-t border-gray-100 p-5 text-right">

          <button
            onClick={onClose}
            className="rounded-xl bg-[#123c35] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0d302a]"
          >
            Close
          </button>

        </div>

      </div>
    </div>
  );
};

/* =====================================================
   SECTION
===================================================== */

const Section = ({
  title,
  children,
}) => (
  <div>

    <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#123c35]">
      {title}
    </h3>

    {children}

  </div>
);

/* =====================================================
   INPUT
===================================================== */

const Input = ({
  label,
  ...props
}) => (
  <div>

    <label className="mb-1.5 block text-sm font-medium text-gray-700">
      {label}
      {props.required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>

    <input
      {...props}
      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"
    />

  </div>
);

/* =====================================================
   SELECT
===================================================== */

const Select = ({
  label,
  options,
  ...props
}) => (
  <div>

    <label className="mb-1.5 block text-sm font-medium text-gray-700">
      {label}
      {props.required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>

    <select
      {...props}
      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"
    >

      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}

    </select>

  </div>
);

/* =====================================================
   TEXTAREA
===================================================== */

const Textarea = ({
  label,
  ...props
}) => (
  <div>

    <label className="mb-1.5 block text-sm font-medium text-gray-700">
      {label}
    </label>

    <textarea
      {...props}
      rows="3"
      className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100"
    />

  </div>
);

/* =====================================================
   INFO
===================================================== */

const Info = ({
  label,
  value,
}) => (
  <div className="rounded-xl bg-gray-50 p-4">

    <p className="text-xs font-medium text-gray-400">
      {label}
    </p>

    <p className="mt-1 break-words text-sm font-semibold text-gray-800">
      {value || "—"}
    </p>

  </div>
);

export default Patients;