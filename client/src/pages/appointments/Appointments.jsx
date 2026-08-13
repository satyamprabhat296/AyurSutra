import { useEffect, useMemo, useState } from "react";

import AppointmentModal from "../../components/appointments/AppointmentModal";

import {
  getAppointments,
  cancelAppointment,
  updateAppointmentStatus,
} from "../../services/appointmentService";


// ==========================================
// STATUS STYLES
// ==========================================

const statusStyles = {
  BOOKED:
    "bg-blue-50 text-blue-700 border-blue-200",

  CHECKED_IN:
    "bg-amber-50 text-amber-700 border-amber-200",

  IN_CONSULTATION:
    "bg-purple-50 text-purple-700 border-purple-200",

  COMPLETED:
    "bg-emerald-50 text-emerald-700 border-emerald-200",

  CANCELLED:
    "bg-red-50 text-red-700 border-red-200",

  NO_SHOW:
    "bg-gray-100 text-gray-600 border-gray-200",
};


// ==========================================
// FORMAT DATE
// ==========================================

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};


// ==========================================
// PATIENT NAME
// ==========================================

const getPatientName = (patient) => {
  if (!patient) {
    return "Unknown Patient";
  }

  const firstName =
    patient.basicInfo?.firstName || "";

  const lastName =
    patient.basicInfo?.lastName || "";

  return (
    `${firstName} ${lastName}`.trim() ||
    "Unknown Patient"
  );
};


// ==========================================
// DOCTOR NAME
// ==========================================

const getDoctorName = (doctor) => {
  return doctor?.name || "Unknown Doctor";
};


// ==========================================
// FORMAT STATUS
// ==========================================

const formatStatus = (status) => {
  if (!status) return "-";

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
};


// ==========================================
// APPOINTMENTS COMPONENT
// ==========================================

export default function Appointments() {

  // ========================================
  // STATE
  // ========================================

  const [appointments, setAppointments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  // IMPORTANT:
  // This hook MUST be inside the component.
  const [showModal, setShowModal] =
    useState(false);


  // ========================================
  // LOAD APPOINTMENTS
  // ========================================

  const loadAppointments = async () => {
    try {

      setLoading(true);
      setError("");

      const data =
        await getAppointments();

      setAppointments(
        data?.appointments || []
      );

    } catch (error) {

      console.error(
        "Failed to load appointments:",
        error
      );

      setError(
        error.response?.data?.message ||
        "Failed to load appointments."
      );

    } finally {

      setLoading(false);

    }
  };


  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    loadAppointments();
  }, []);


  // ========================================
  // FILTER APPOINTMENTS
  // ========================================

  const filteredAppointments = useMemo(() => {

    return appointments.filter(
      (appointment) => {

        const patientName =
          getPatientName(
            appointment.patient
          );

        const doctorName =
          getDoctorName(
            appointment.doctor
          );

        const searchText =
          search.toLowerCase().trim();


        const matchesSearch =
          !searchText ||
          patientName
            .toLowerCase()
            .includes(searchText) ||

          doctorName
            .toLowerCase()
            .includes(searchText) ||

          appointment.appointmentNumber
            ?.toLowerCase()
            .includes(searchText);


        const matchesStatus =
          statusFilter === "ALL" ||
          appointment.status ===
            statusFilter;


        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );

  }, [
    appointments,
    search,
    statusFilter,
  ]);


  // ========================================
  // UPDATE STATUS
  // ========================================

  const handleStatusChange = async (
    id,
    status
  ) => {

    try {

      await updateAppointmentStatus(
        id,
        status
      );

      await loadAppointments();

    } catch (error) {

      console.error(
        "Failed to update appointment:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to update appointment."
      );
    }
  };


  // ========================================
  // CANCEL APPOINTMENT
  // ========================================

  const handleCancel = async (id) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this appointment?"
      );

    if (!confirmed) {
      return;
    }

    try {

      await cancelAppointment(id);

      await loadAppointments();

    } catch (error) {

      console.error(
        "Failed to cancel appointment:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Failed to cancel appointment."
      );
    }
  };


  // ========================================
  // STATISTICS
  // ========================================

  const total =
    appointments.length;

  const booked =
    appointments.filter(
      (item) =>
        item.status === "BOOKED"
    ).length;

  const checkedIn =
    appointments.filter(
      (item) =>
        item.status === "CHECKED_IN"
    ).length;

  const inConsultation =
    appointments.filter(
      (item) =>
        item.status ===
        "IN_CONSULTATION"
    ).length;

  const completed =
    appointments.filter(
      (item) =>
        item.status === "COMPLETED"
    ).length;

  const cancelled =
    appointments.filter(
      (item) =>
        item.status === "CANCELLED"
    ).length;


  // ========================================
  // UI
  // ========================================

  return (

    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">


        {/* ==================================
            HEADER
        ================================== */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="mb-1 text-sm font-medium text-emerald-600">
              AyurSutra
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Appointments
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage patient appointments and daily schedules.
            </p>

          </div>


          <button
            type="button"
            onClick={() =>
              setShowModal(true)
            }
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
          >
            + New Appointment
          </button>

        </div>


        {/* ==================================
            STATISTICS
        ================================== */}

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">


          {/* Total */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Total
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {total}
            </p>

          </div>


          {/* Booked */}

          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Booked
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {booked}
            </p>

          </div>


          {/* Checked In */}

          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Checked In
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-600">
              {checkedIn}
            </p>

          </div>


          {/* Consultation */}

          <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Consultation
            </p>

            <p className="mt-2 text-2xl font-bold text-purple-600">
              {inConsultation}
            </p>

          </div>


          {/* Completed */}

          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Completed
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {completed}
            </p>

          </div>


          {/* Cancelled */}

          <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Cancelled
            </p>

            <p className="mt-2 text-2xl font-bold text-red-600">
              {cancelled}
            </p>

          </div>

        </div>


        {/* ==================================
            FILTERS
        ================================== */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 md:flex-row">


            {/* Search */}

            <div className="relative flex-1">

              <input
                type="text"
                placeholder="Search patient, doctor or appointment number..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />

            </div>


            {/* Status */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            >

              <option value="ALL">
                All Statuses
              </option>

              <option value="BOOKED">
                Booked
              </option>

              <option value="CHECKED_IN">
                Checked In
              </option>

              <option value="IN_CONSULTATION">
                In Consultation
              </option>

              <option value="COMPLETED">
                Completed
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>

              <option value="NO_SHOW">
                No Show
              </option>

            </select>

          </div>

        </div>


        {/* ==================================
            ERROR
        ================================== */}

        {error && (

          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={loadAppointments}
              className="font-semibold underline"
            >
              Retry
            </button>

          </div>

        )}


        {/* ==================================
            APPOINTMENT TABLE
        ================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="min-w-full">


              {/* TABLE HEADER */}

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Appointment
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Patient
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Doctor
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date & Time
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Token
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>

                </tr>

              </thead>


              {/* TABLE BODY */}

              <tbody className="divide-y divide-slate-100">


                {/* LOADING */}

                {loading ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="px-5 py-16 text-center"
                    >

                      <div className="flex flex-col items-center">

                        <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

                        <p className="text-sm text-slate-500">
                          Loading appointments...
                        </p>

                      </div>

                    </td>

                  </tr>


                ) : filteredAppointments.length === 0 ? (

                  /* EMPTY */

                  <tr>

                    <td
                      colSpan="7"
                      className="px-5 py-16 text-center"
                    >

                      <div className="mx-auto max-w-sm">

                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                          📅
                        </div>

                        <p className="font-semibold text-slate-700">
                          No appointments found
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          Try changing your search or status filter.
                        </p>

                      </div>

                    </td>

                  </tr>


                ) : (

                  /* DATA */

                  filteredAppointments.map(
                    (appointment) => (

                      <tr
                        key={appointment._id}
                        className="transition hover:bg-slate-50"
                      >


                        {/* Appointment */}

                        <td className="px-5 py-4">

                          <p className="font-semibold text-slate-900">
                            {appointment.appointmentNumber}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {appointment.visitType ===
                            "FOLLOW_UP"
                              ? "Follow-up"
                              : "New Visit"}
                          </p>

                        </td>


                        {/* Patient */}

                        <td className="px-5 py-4">

                          <p className="font-medium text-slate-800">
                            {getPatientName(
                              appointment.patient
                            )}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {appointment.patient
                              ?.patientId ||
                              "-"}
                          </p>

                        </td>


                        {/* Doctor */}

                        <td className="px-5 py-4">

                          <p className="font-medium text-slate-800">
                            {getDoctorName(
                              appointment.doctor
                            )}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {appointment.doctor
                              ?.specialization ||
                              "-"}
                          </p>

                        </td>


                        {/* Date */}

                        <td className="px-5 py-4">

                          <p className="font-medium text-slate-800">
                            {formatDate(
                              appointment.appointmentDate
                            )}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {appointment.appointmentTime ||
                              "-"}
                          </p>

                        </td>


                        {/* Token */}

                        <td className="px-5 py-4">

                          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-emerald-50 px-2 text-sm font-bold text-emerald-700">
                            {appointment.tokenNumber ??
                              "-"}
                          </span>

                        </td>


                        {/* Status */}

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                              statusStyles[
                                appointment.status
                              ] ||
                              "border-slate-200 bg-slate-100 text-slate-600"
                            }`}
                          >
                            {formatStatus(
                              appointment.status
                            )}
                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">


                            {/* CHECK IN */}

                            {appointment.status ===
                              "BOOKED" && (

                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(
                                    appointment._id,
                                    "CHECKED_IN"
                                  )
                                }
                                className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                              >
                                Check In
                              </button>

                            )}


                            {/* CONSULT */}

                            {appointment.status ===
                              "CHECKED_IN" && (

                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(
                                    appointment._id,
                                    "IN_CONSULTATION"
                                  )
                                }
                                className="rounded-lg bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 transition hover:bg-purple-100"
                              >
                                Consult
                              </button>

                            )}


                            {/* COMPLETE */}

                            {appointment.status ===
                              "IN_CONSULTATION" && (

                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(
                                    appointment._id,
                                    "COMPLETED"
                                  )
                                }
                                className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                              >
                                Complete
                              </button>

                            )}


                            {/* CANCEL */}

                            {[
                              "BOOKED",
                              "CHECKED_IN",
                            ].includes(
                              appointment.status
                            ) && (

                              <button
                                type="button"
                                onClick={() =>
                                  handleCancel(
                                    appointment._id
                                  )
                                }
                                className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                              >
                                Cancel
                              </button>

                            )}

                          </div>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>


      </div>


      {/* ==================================
          APPOINTMENT MODAL
      ================================== */}

      {showModal && (

        <AppointmentModal
          onClose={() =>
            setShowModal(false)
          }
          onSuccess={() => {
            setShowModal(false);
            loadAppointments();
          }}
        />

      )}

    </div>
  );
}