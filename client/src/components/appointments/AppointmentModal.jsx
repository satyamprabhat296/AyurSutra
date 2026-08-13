import { useEffect, useMemo, useState } from "react";

import {
  createAppointment,
} from "../../services/appointmentService";

import {
  getPatients,
} from "../../services/patientService";

import {
  getStaff,
} from "../../services/staffService";


// ==========================================
// HELPERS
// ==========================================

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


const getPatientName = (patient) => {
  const firstName =
    patient?.basicInfo?.firstName || "";

  const lastName =
    patient?.basicInfo?.lastName || "";

  return (
    `${firstName} ${lastName}`.trim() ||
    "Unnamed Patient"
  );
};


const getPatientPhone = (patient) => {
  return patient?.contact?.phone || "";
};


const getDoctorName = (doctor) => {
  return doctor?.name || "Unnamed Doctor";
};


// ==========================================
// COMPONENT
// ==========================================

export default function AppointmentModal({
  onClose,
  onSuccess,
}) {

  // ========================================
  // DATA STATE
  // ========================================

  const [patients, setPatients] =
    useState([]);

  const [doctors, setDoctors] =
    useState([]);


  // ========================================
  // UI STATE
  // ========================================

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [fieldErrors, setFieldErrors] =
    useState({});


  // ========================================
  // FORM STATE
  // ========================================

  const [form, setForm] = useState({
    patient: "",
    doctor: "",
    appointmentDate: "",
    appointmentTime: "",
    visitType: "NEW",
    chiefComplaint: "",
    notes: "",
    followUpDate: "",
  });


  // ========================================
  // LOAD PATIENTS + DOCTORS
  // ========================================

  useEffect(() => {
    loadData();
  }, []);


  const loadData = async () => {
    try {

      setLoading(true);
      setError("");

      const [
        patientData,
        staffData,
      ] = await Promise.all([
        getPatients(),
        getStaff(),
      ]);


      const patientList =
        patientData?.patients || [];

      const staffList =
        staffData?.staff ||
        staffData?.data ||
        [];


      setPatients(patientList);


      const doctorList =
        staffList.filter(
          (member) =>
            member?.role?.toLowerCase() ===
            "doctor"
        );


      setDoctors(doctorList);

    } catch (error) {

      console.error(
        "Failed to load appointment data:",
        error
      );

      setError(
        error?.response?.data?.message ||
        "Failed to load patients and doctors. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };


  // ========================================
  // SELECTED PATIENT
  // ========================================

  const selectedPatient = useMemo(() => {

    return patients.find(
      (patient) =>
        patient._id === form.patient
    );

  }, [
    patients,
    form.patient,
  ]);


  // ========================================
  // SELECTED DOCTOR
  // ========================================

  const selectedDoctor = useMemo(() => {

    return doctors.find(
      (doctor) =>
        doctor._id === form.doctor
    );

  }, [
    doctors,
    form.doctor,
  ]);


  // ========================================
  // FORM CHANGE
  // ========================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));


    setFieldErrors((previous) => ({
      ...previous,
      [name]: "",
    }));


    setError("");
  };


  // ========================================
  // VALIDATION
  // ========================================

  const validateForm = () => {

    const errors = {};

    if (!form.patient) {
      errors.patient =
        "Please select a patient.";
    }

    if (!form.doctor) {
      errors.doctor =
        "Please select a doctor.";
    }

    if (!form.appointmentDate) {
      errors.appointmentDate =
        "Appointment date is required.";
    }

    if (!form.appointmentTime) {
      errors.appointmentTime =
        "Appointment time is required.";
    }


    if (
      form.appointmentDate &&
      form.appointmentDate < getToday()
    ) {
      errors.appointmentDate =
        "Appointment date cannot be in the past.";
    }


    if (
      form.visitType === "FOLLOW_UP" &&
      form.followUpDate &&
      form.appointmentDate &&
      form.followUpDate <
        form.appointmentDate
    ) {
      errors.followUpDate =
        "Follow-up date cannot be before the appointment date.";
    }


    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };


  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    if (saving) {
      return;
    }


    const isValid =
      validateForm();


    if (!isValid) {
      return;
    }


    try {

      setSaving(true);
      setError("");


      const payload = {
        patient: form.patient,
        doctor: form.doctor,
        appointmentDate:
          form.appointmentDate,
        appointmentTime:
          form.appointmentTime,
        visitType:
          form.visitType,
        chiefComplaint:
          form.chiefComplaint.trim(),
        notes:
          form.notes.trim(),
      };


      if (form.followUpDate) {
        payload.followUpDate =
          form.followUpDate;
      }


      await createAppointment(payload);


      // Parent handles refresh + modal close
      await onSuccess?.();

    } catch (error) {

      console.error(
        "Failed to create appointment:",
        error
      );


      setError(
        error?.response?.data?.message ||
        "Failed to create appointment. Please try again."
      );

    } finally {

      setSaving(false);

    }
  };


  // ========================================
  // CLOSE MODAL
  // ========================================

  const handleClose = () => {

    if (saving) {
      return;
    }

    onClose?.();
  };


  // ========================================
  // UI
  // ========================================

  return (

    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {

        if (
          e.target === e.currentTarget &&
          !saving
        ) {
          handleClose();
        }

      }}
    >

      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >


        {/* ==================================
            HEADER
        ================================== */}

        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-xl">
              📅
            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                New Appointment
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Schedule a patient consultation.
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-2xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>

        </div>


        {/* ==================================
            BODY
        ================================== */}

        <div className="overflow-y-auto">

          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6"
          >


            {/* ==================================
                ERROR
            ================================== */}

            {error && (

              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4">

                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-sm">
                  !
                </div>

                <div>

                  <p className="text-sm font-semibold text-red-800">
                    Unable to continue
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    {error}
                  </p>

                </div>

              </div>

            )}


            {/* ==================================
                LOADING
            ================================== */}

            {loading ? (

              <div className="flex flex-col items-center justify-center py-16">

                <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

                <p className="text-sm font-medium text-slate-600">
                  Loading patients and doctors...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Please wait
                </p>

              </div>

            ) : (

              <>


                {/* ==================================
                    PATIENT + DOCTOR
                ================================== */}

                <div>

                  <div className="mb-4">

                    <h3 className="text-sm font-bold text-slate-900">
                      Appointment Details
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Select the patient and doctor for this appointment.
                    </p>

                  </div>


                  <div className="grid gap-5 md:grid-cols-2">


                    {/* Patient */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Patient
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <select
                        name="patient"
                        value={form.patient}
                        onChange={handleChange}
                        required
                        className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                          fieldErrors.patient
                            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                            : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                        }`}
                      >

                        <option value="">
                          Select patient
                        </option>

                        {patients.map(
                          (patient) => (

                            <option
                              key={
                                patient._id
                              }
                              value={
                                patient._id
                              }
                            >
                              {patient.patientId} —{" "}
                              {getPatientName(
                                patient
                              )}
                            </option>

                          )
                        )}

                      </select>


                      {fieldErrors.patient && (

                        <p className="mt-1.5 text-xs text-red-600">
                          {fieldErrors.patient}
                        </p>

                      )}


                      {patients.length === 0 && (

                        <p className="mt-2 text-xs text-amber-600">
                          No active patients found.
                        </p>

                      )}

                    </div>


                    {/* Doctor */}

                    <div>

                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Doctor
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <select
                        name="doctor"
                        value={form.doctor}
                        onChange={handleChange}
                        required
                        className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                          fieldErrors.doctor
                            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                            : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                        }`}
                      >

                        <option value="">
                          Select doctor
                        </option>

                        {doctors.map(
                          (doctor) => (

                            <option
                              key={
                                doctor._id
                              }
                              value={
                                doctor._id
                              }
                            >
                              {getDoctorName(
                                doctor
                              )}

                              {doctor.specialization
                                ? ` — ${doctor.specialization}`
                                : ""}
                            </option>

                          )
                        )}

                      </select>


                      {fieldErrors.doctor && (

                        <p className="mt-1.5 text-xs text-red-600">
                          {fieldErrors.doctor}
                        </p>

                      )}


                      {doctors.length === 0 && (

                        <p className="mt-2 text-xs text-amber-600">
                          No doctors found.
                        </p>

                      )}

                    </div>

                  </div>

                </div>


                {/* ==================================
                    SELECTED PATIENT INFO
                ================================== */}

                {selectedPatient && (

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                          Selected Patient
                        </p>

                        <p className="mt-1 font-bold text-slate-900">
                          {getPatientName(
                            selectedPatient
                          )}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">

                          <span>
                            ID:{" "}
                            <strong className="text-slate-700">
                              {selectedPatient.patientId ||
                                "-"}
                            </strong>
                          </span>

                          {getPatientPhone(
                            selectedPatient
                          ) && (

                            <span>
                              Phone:{" "}
                              <strong className="text-slate-700">
                                {getPatientPhone(
                                  selectedPatient
                                )}
                              </strong>
                            </span>

                          )}

                        </div>

                      </div>


                      <div className="hidden rounded-xl bg-white px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm sm:block">
                        Patient selected
                      </div>

                    </div>

                  </div>

                )}


                {/* ==================================
                    DATE + TIME
                ================================== */}

                <div className="grid gap-5 md:grid-cols-2">


                  {/* Date */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Appointment Date
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      type="date"
                      name="appointmentDate"
                      value={
                        form.appointmentDate
                      }
                      onChange={handleChange}
                      min={getToday()}
                      required
                      className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                        fieldErrors.appointmentDate
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                      }`}
                    />

                    {fieldErrors.appointmentDate && (

                      <p className="mt-1.5 text-xs text-red-600">
                        {
                          fieldErrors.appointmentDate
                        }
                      </p>

                    )}

                  </div>


                  {/* Time */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Appointment Time
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      type="time"
                      name="appointmentTime"
                      value={
                        form.appointmentTime
                      }
                      onChange={handleChange}
                      required
                      className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                        fieldErrors.appointmentTime
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                      }`}
                    />

                    {fieldErrors.appointmentTime && (

                      <p className="mt-1.5 text-xs text-red-600">
                        {
                          fieldErrors.appointmentTime
                        }
                      </p>

                    )}

                  </div>

                </div>


                {/* ==================================
                    VISIT TYPE
                ================================== */}

                <div>

                  <label className="mb-3 block text-sm font-semibold text-slate-700">
                    Visit Type
                  </label>


                  <div className="grid gap-3 sm:grid-cols-2">


                    {/* New */}

                    <label
                      className={`group cursor-pointer rounded-2xl border p-4 transition ${
                        form.visitType ===
                        "NEW"
                          ? "border-emerald-500 bg-emerald-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50"
                      }`}
                    >

                      <input
                        type="radio"
                        name="visitType"
                        value="NEW"
                        checked={
                          form.visitType ===
                          "NEW"
                        }
                        onChange={handleChange}
                        className="sr-only"
                      />

                      <div className="flex items-center gap-3">

                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            form.visitType ===
                            "NEW"
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          +
                        </div>

                        <div>

                          <p className="font-semibold text-slate-800">
                            New Visit
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            First consultation
                          </p>

                        </div>

                      </div>

                    </label>


                    {/* Follow Up */}

                    <label
                      className={`group cursor-pointer rounded-2xl border p-4 transition ${
                        form.visitType ===
                        "FOLLOW_UP"
                          ? "border-emerald-500 bg-emerald-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50"
                      }`}
                    >

                      <input
                        type="radio"
                        name="visitType"
                        value="FOLLOW_UP"
                        checked={
                          form.visitType ===
                          "FOLLOW_UP"
                        }
                        onChange={handleChange}
                        className="sr-only"
                      />

                      <div className="flex items-center gap-3">

                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            form.visitType ===
                            "FOLLOW_UP"
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          ↻
                        </div>

                        <div>

                          <p className="font-semibold text-slate-800">
                            Follow-up
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Existing patient
                          </p>

                        </div>

                      </div>

                    </label>

                  </div>

                </div>


                {/* ==================================
                    CHIEF COMPLAINT
                ================================== */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Chief Complaint
                  </label>

                  <input
                    type="text"
                    name="chiefComplaint"
                    value={
                      form.chiefComplaint
                    }
                    onChange={handleChange}
                    placeholder="e.g. Back pain, digestion issues..."
                    maxLength={500}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />

                  <p className="mt-1.5 text-right text-xs text-slate-400">
                    {form.chiefComplaint.length}/500
                  </p>

                </div>


                {/* ==================================
                    NOTES
                ================================== */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={4}
                    maxLength={1000}
                    placeholder="Add any additional information for the doctor..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />

                  <p className="mt-1.5 text-right text-xs text-slate-400">
                    {form.notes.length}/1000
                  </p>

                </div>


                {/* ==================================
                    FOLLOW UP DATE
                ================================== */}

                {form.visitType ===
                  "FOLLOW_UP" && (

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Follow-up Date
                    </label>

                    <input
                      type="date"
                      name="followUpDate"
                      value={
                        form.followUpDate
                      }
                      onChange={handleChange}
                      min={
                        form.appointmentDate ||
                        getToday()
                      }
                      className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 ${
                        fieldErrors.followUpDate
                          ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                          : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-100"
                      }`}
                    />

                    {fieldErrors.followUpDate && (

                      <p className="mt-1.5 text-xs text-red-600">
                        {
                          fieldErrors.followUpDate
                        }
                      </p>

                    )}

                  </div>

                )}


                {/* ==================================
                    APPOINTMENT SUMMARY
                ================================== */}

                {(selectedPatient ||
                  selectedDoctor ||
                  form.appointmentDate ||
                  form.appointmentTime) && (

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                    <div className="mb-4">

                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Appointment Summary
                      </p>

                    </div>


                    <div className="grid gap-4 sm:grid-cols-2">


                      <div>

                        <p className="text-xs text-slate-400">
                          Patient
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {selectedPatient
                            ? getPatientName(
                                selectedPatient
                              )
                            : "Not selected"}
                        </p>

                      </div>


                      <div>

                        <p className="text-xs text-slate-400">
                          Doctor
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {selectedDoctor
                            ? getDoctorName(
                                selectedDoctor
                              )
                            : "Not selected"}
                        </p>

                      </div>


                      <div>

                        <p className="text-xs text-slate-400">
                          Date
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {form.appointmentDate ||
                            "Not selected"}
                        </p>

                      </div>


                      <div>

                        <p className="text-xs text-slate-400">
                          Time
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {form.appointmentTime ||
                            "Not selected"}
                        </p>

                      </div>

                    </div>

                  </div>

                )}

              </>

            )}


            {/* ==================================
                FOOTER
            ================================== */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>


              <button
                type="submit"
                disabled={
                  loading ||
                  saving ||
                  patients.length === 0 ||
                  doctors.length === 0
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >

                {saving ? (

                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Booking...

                  </>

                ) : (

                  <>
                    <span>
                      ✓
                    </span>

                    Book Appointment
                  </>

                )}

              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  ); 
}