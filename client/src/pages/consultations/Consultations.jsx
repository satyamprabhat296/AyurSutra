import { useEffect, useState } from "react";

import {
  getConsultations,
} from "../../services/consultationService";

import ConsultationModal from "../../components/consultations/ConsultationModal";


export default function Consultations() {

  const [consultations, setConsultations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);


  // ==========================================
  // LOAD CONSULTATIONS
  // ==========================================

  const loadConsultations = async () => {

    try {

      setLoading(true);
      setError("");

      const data =
        await getConsultations();

      setConsultations(
        data?.consultations || []
      );

    } catch (error) {

      console.error(
        "Failed to load consultations:",
        error
      );

      setError(
        error?.response?.data?.message ||
        "Failed to load consultations."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadConsultations();
  }, []);


  // ==========================================
  // HELPERS
  // ==========================================

  const getPatientName = (consultation) => {

    const patient =
      consultation?.patient;

    const firstName =
      patient?.basicInfo?.firstName || "";

    const lastName =
      patient?.basicInfo?.lastName || "";

    return (
      `${firstName} ${lastName}`.trim() ||
      "Unknown Patient"
    );
  };


  const getDoctorName = (consultation) => {

    return (
      consultation?.doctor?.name ||
      "Unknown Doctor"
    );
  };


  const formatDate = (date) => {

    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  const getStatusClasses = (status) => {

    switch (status) {

      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "DRAFT":
        return "bg-amber-50 text-amber-700 border-amber-200";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };


  // ==========================================
  // UI
  // ==========================================

  return (

    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">


        {/* ==================================
            HEADER
        ================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-xl">
                🩺
              </div>

              <div>

                <h1 className="text-2xl font-bold text-slate-900">
                  Consultations
                </h1>

                <p className="text-sm text-slate-500">
                  Manage patient consultations and clinical records.
                </p>

              </div>

            </div>

          </div>


          <button
            type="button"
            onClick={() =>
              setShowModal(true)
            }
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
          >
            + New Consultation
          </button>

        </div>


        {/* ==================================
            STATS
        ================================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
              Total Consultations
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {consultations.length}
            </p>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {
                consultations.filter(
                  (item) =>
                    item.status ===
                    "COMPLETED"
                ).length
              }
            </p>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
              Today's Consultations
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {
                consultations.filter(
                  (item) => {

                    if (!item.createdAt) {
                      return false;
                    }

                    const today =
                      new Date();

                    const date =
                      new Date(
                        item.createdAt
                      );

                    return (
                      today.toDateString() ===
                      date.toDateString()
                    );

                  }
                ).length
              }
            </p>

          </div>

        </div>


        {/* ==================================
            ERROR
        ================================== */}

        {error && (

          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">

            <p className="text-sm font-semibold text-red-800">
              Unable to load consultations
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>

          </div>

        )}


        {/* ==================================
            TABLE
        ================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-4">

            <h2 className="font-semibold text-slate-900">
              Consultation Records
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Recent clinical consultations
            </p>

          </div>


          {loading ? (

            <div className="flex flex-col items-center justify-center py-20">

              <div className="mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

              <p className="text-sm text-slate-500">
                Loading consultations...
              </p>

            </div>

          ) : consultations.length === 0 ? (

            <div className="px-6 py-20 text-center">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                🩺
              </div>

              <h3 className="font-semibold text-slate-900">
                No consultations yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Start a consultation from an appointment or create a new consultation.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowModal(true)
                }
                className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                + New Consultation
              </button>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Patient
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Doctor
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Complaint
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Date
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-slate-100">

                  {consultations.map(
                    (consultation) => (

                      <tr
                        key={
                          consultation._id
                        }
                        className="transition hover:bg-slate-50"
                      >

                        <td className="px-5 py-4">

                          <div>

                            <p className="font-semibold text-slate-800">
                              {getPatientName(
                                consultation
                              )}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {
                                consultation
                                  ?.patient
                                  ?.patientId ||
                                "-"
                              }
                            </p>

                          </div>

                        </td>


                        <td className="px-5 py-4">

                          <p className="text-sm font-medium text-slate-700">
                            Dr.{" "}
                            {getDoctorName(
                              consultation
                            )}
                          </p>

                        </td>


                        <td className="max-w-xs px-5 py-4">

                          <p className="truncate text-sm text-slate-600">
                            {
                              consultation.chiefComplaint ||
                              "No complaint recorded"
                            }
                          </p>

                        </td>


                        <td className="px-5 py-4">

                          <p className="text-sm text-slate-600">
                            {formatDate(
                              consultation.createdAt
                            )}
                          </p>

                        </td>


                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              consultation.status
                            )}`}
                          >
                            {consultation.status ||
                              "COMPLETED"}
                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>


      {/* ==================================
          MODAL
      ================================== */}

      {showModal && (

        <ConsultationModal
          onClose={() =>
            setShowModal(false)
          }
          onSuccess={async () => {

            setShowModal(false);

            await loadConsultations();

          }}
        />

      )}

    </div>
  );
}