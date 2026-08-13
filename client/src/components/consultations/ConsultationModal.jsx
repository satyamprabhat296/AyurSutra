import { useEffect, useState } from "react";

import {
  createConsultation,
} from "../../services/consultationService";

import {
  getAppointments,
} from "../../services/appointmentService";


const initialVitals = {
  bloodPressure: "",
  pulse: "",
  temperature: "",
  weight: "",
  height: "",
  spo2: "",
};


const initialForm = {
  appointment: "",
  patient: "",
  doctor: "",
  vitals: initialVitals,
  chiefComplaint: "",
  diagnosis: "",
  prescription: [],
  therapies: [],
  advice: "",
  followUpDate: "",
};


export default function ConsultationModal({
  onClose,
  onSuccess,
}) {

  const [form, setForm] =
    useState(initialForm);

  const [appointments, setAppointments] =
    useState([]);

  const [loadingAppointments, setLoadingAppointments] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // ==========================================
  // LOAD APPOINTMENTS
  // ==========================================

  useEffect(() => {

    const loadAppointments = async () => {

      try {

        setLoadingAppointments(true);
        setError("");

        const response =
          await getAppointments();

        const list =
          response?.appointments || [];

        // Only show usable appointments
        const available =
          list.filter(
            (appointment) =>
              appointment.status !==
                "CANCELLED" &&
              appointment.status !==
                "COMPLETED"
          );

        setAppointments(available);

      } catch (err) {

        console.error(
          "Failed to load appointments:",
          err
        );

        setError(
          err?.response?.data?.message ||
          "Unable to load appointments."
        );

      } finally {

        setLoadingAppointments(false);

      }
    };

    loadAppointments();

  }, []);


  // ==========================================
  // SELECT APPOINTMENT
  // ==========================================

  const handleAppointmentChange = (e) => {

    const appointmentId =
      e.target.value;

    const selected =
      appointments.find(
        (item) =>
          item._id === appointmentId
      );

    if (!selected) {

      setForm({
        ...form,
        appointment: "",
        patient: "",
        doctor: "",
      });

      return;
    }

    setForm({
      ...form,
      appointment: selected._id,
      patient:
        selected.patient?._id || "",
      doctor:
        selected.doctor?._id || "",
    });

  };


  // ==========================================
  // BASIC INPUT
  // ==========================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

  };


  // ==========================================
  // VITALS
  // ==========================================

  const handleVitalChange = (
    e
  ) => {

    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,

      vitals: {
        ...prev.vitals,
        [name]: value,
      },
    }));

  };


  // ==========================================
  // MEDICINES
  // ==========================================

  const addMedicine = () => {

    setForm((prev) => ({
      ...prev,

      prescription: [
        ...prev.prescription,
        {
          medicine: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
        },
      ],
    }));

  };


  const removeMedicine = (
    index
  ) => {

    setForm((prev) => ({
      ...prev,

      prescription:
        prev.prescription.filter(
          (_, i) => i !== index
        ),
    }));

  };


  const handleMedicineChange = (
    index,
    field,
    value
  ) => {

    setForm((prev) => {

      const prescription =
        [...prev.prescription];

      prescription[index] = {
        ...prescription[index],
        [field]: value,
      };

      return {
        ...prev,
        prescription,
      };

    });

  };


  // ==========================================
  // THERAPIES
  // ==========================================

  const addTherapy = () => {

    setForm((prev) => ({
      ...prev,

      therapies: [
        ...prev.therapies,
        {
          therapy: "",
          therapist: "",
          sessions: "",
          status: "PENDING",
        },
      ],
    }));

  };


  const removeTherapy = (
    index
  ) => {

    setForm((prev) => ({
      ...prev,

      therapies:
        prev.therapies.filter(
          (_, i) => i !== index
        ),
    }));

  };


  const handleTherapyChange = (
    index,
    field,
    value
  ) => {

    setForm((prev) => {

      const therapies =
        [...prev.therapies];

      therapies[index] = {
        ...therapies[index],
        [field]: value,
      };

      return {
        ...prev,
        therapies,
      };

    });

  };


  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault();

    setError("");
    setSuccess("");


    if (!form.appointment) {

      setError(
        "Please select an appointment."
      );

      return;
    }


    if (!form.patient) {

      setError(
        "Patient information is missing from the appointment."
      );

      return;
    }


    if (!form.doctor) {

      setError(
        "Doctor information is missing from the appointment."
      );

      return;
    }


    try {

      setSubmitting(true);


      const payload = {
        appointment:
          form.appointment,

        patient:
          form.patient,

        doctor:
          form.doctor,

        vitals: {
          bloodPressure:
            form.vitals.bloodPressure ||
            undefined,

          pulse:
            form.vitals.pulse
              ? Number(
                  form.vitals.pulse
                )
              : undefined,

          temperature:
            form.vitals.temperature
              ? Number(
                  form.vitals.temperature
                )
              : undefined,

          weight:
            form.vitals.weight
              ? Number(
                  form.vitals.weight
                )
              : undefined,

          height:
            form.vitals.height
              ? Number(
                  form.vitals.height
                )
              : undefined,

          spo2:
            form.vitals.spo2
              ? Number(
                  form.vitals.spo2
                )
              : undefined,
        },

        chiefComplaint:
          form.chiefComplaint,

        diagnosis:
          form.diagnosis,

        prescription:
          form.prescription.filter(
            (item) =>
              item.medicine
        ),

        therapies:
          form.therapies.filter(
            (item) =>
              item.therapy
        ),

        advice:
          form.advice,

        followUpDate:
          form.followUpDate ||
          undefined,
      };


      await createConsultation(
        payload
      );


      setSuccess(
        "Consultation completed successfully."
      );


      setTimeout(() => {

        onSuccess?.();

      }, 700);


    } catch (err) {

      console.error(
        "Create consultation error:",
        err
      );

      setError(
        err?.response?.data?.message ||
        "Failed to create consultation."
      );

    } finally {

      setSubmitting(false);

    }

  };


  // ==========================================
  // HELPERS
  // ==========================================

  const getPatientName = (
    patient
  ) => {

    const first =
      patient?.basicInfo?.firstName ||
      "";

    const last =
      patient?.basicInfo?.lastName ||
      "";

    return (
      `${first} ${last}`.trim() ||
      "Unknown Patient"
    );

  };


  const getDoctorName = (
    doctor
  ) => {

    return (
      doctor?.name ||
      "Unknown Doctor"
    );

  };


  // ==========================================
  // UI
  // ==========================================

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">


        {/* ==================================
            HEADER
        ================================== */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-xl">
                🩺
              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  New Consultation
                </h2>

                <p className="text-sm text-slate-500">
                  Record the patient's clinical consultation.
                </p>

              </div>

            </div>

          </div>


          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>

        </div>


        {/* ==================================
            BODY
        ================================== */}

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto"
        >

          <div className="space-y-7 p-6">


            {/* ==================================
                ALERTS
            ================================== */}

            {error && (

              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">

                <p className="text-sm font-semibold text-red-800">
                  Unable to save consultation
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>

              </div>

            )}


            {success && (

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                <p className="text-sm font-semibold text-emerald-800">
                  {success}
                </p>

              </div>

            )}


            {/* ==================================
                APPOINTMENT
            ================================== */}

            <section>

              <SectionTitle
                number="01"
                title="Appointment"
                description="Select the appointment for this consultation."
              />


              <div className="mt-4">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Appointment
                </label>

                {loadingAppointments ? (

                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    Loading appointments...
                  </div>

                ) : (

                  <select
                    value={
                      form.appointment
                    }
                    onChange={
                      handleAppointmentChange
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  >

                    <option value="">
                      Select an appointment
                    </option>

                    {appointments.map(
                      (appointment) => (

                        <option
                          key={
                            appointment._id
                          }
                          value={
                            appointment._id
                          }
                        >
                          {appointment.appointmentNumber ||
                            "Appointment"}{" "}
                          —{" "}
                          {getPatientName(
                            appointment.patient
                          )}{" "}
                          — Dr.{" "}
                          {getDoctorName(
                            appointment.doctor
                          )}{" "}
                          —{" "}
                          {appointment.appointmentTime ||
                            ""}
                        </option>

                      )
                    )}

                  </select>

                )}

              </div>


              {/* Selected patient/doctor */}

              {form.appointment && (

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">

                  <InfoCard
                    label="Patient"
                    value={
                      getPatientName(
                        appointments.find(
                          (item) =>
                            item._id ===
                            form.appointment
                        )?.patient
                      )
                    }
                    subValue={
                      appointments.find(
                        (item) =>
                          item._id ===
                          form.appointment
                      )?.patient
                        ?.patientId
                    }
                  />


                  <InfoCard
                    label="Doctor"
                    value={
                      getDoctorName(
                        appointments.find(
                          (item) =>
                            item._id ===
                            form.appointment
                        )?.doctor
                      )
                    }
                    subValue={
                      appointments.find(
                        (item) =>
                          item._id ===
                          form.appointment
                      )?.doctor
                        ?.specialization
                    }
                  />

                </div>

              )}

            </section>


            {/* ==================================
                VITALS
            ================================== */}

            <section>

              <SectionTitle
                number="02"
                title="Patient Vitals"
                description="Record the patient's current vital measurements."
              />


              <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">

                <Input
                  label="Blood Pressure"
                  name="bloodPressure"
                  value={
                    form.vitals
                      .bloodPressure
                  }
                  onChange={
                    handleVitalChange
                  }
                  placeholder="120/80"
                />

                <Input
                  label="Pulse"
                  name="pulse"
                  type="number"
                  value={
                    form.vitals.pulse
                  }
                  onChange={
                    handleVitalChange
                  }
                  placeholder="72"
                  suffix="bpm"
                />

                <Input
                  label="Temperature"
                  name="temperature"
                  type="number"
                  step="0.1"
                  value={
                    form.vitals.temperature
                  }
                  onChange={
                    handleVitalChange
                  }
                  placeholder="98.6"
                  suffix="°F"
                />

                <Input
                  label="Weight"
                  name="weight"
                  type="number"
                  step="0.1"
                  value={
                    form.vitals.weight
                  }
                  onChange={
                    handleVitalChange
                  }
                  placeholder="70"
                  suffix="kg"
                />

                <Input
                  label="Height"
                  name="height"
                  type="number"
                  step="0.1"
                  value={
                    form.vitals.height
                  }
                  onChange={
                    handleVitalChange
                  }
                  placeholder="170"
                  suffix="cm"
                />

                <Input
                  label="SpO₂"
                  name="spo2"
                  type="number"
                  value={
                    form.vitals.spo2
                  }
                  onChange={
                    handleVitalChange
                  }
                  placeholder="98"
                  suffix="%"
                />

              </div>

            </section>


            {/* ==================================
                CLINICAL ASSESSMENT
            ================================== */}

            <section>

              <SectionTitle
                number="03"
                title="Clinical Assessment"
                description="Document the patient's symptoms and clinical diagnosis."
              />


              <div className="mt-4 space-y-4">

                <TextArea
                  label="Chief Complaint"
                  name="chiefComplaint"
                  value={
                    form.chiefComplaint
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Describe the patient's primary complaint..."
                  rows={4}
                />


                <TextArea
                  label="Diagnosis"
                  name="diagnosis"
                  value={
                    form.diagnosis
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter diagnosis / clinical findings..."
                  rows={4}
                />

              </div>

            </section>


            {/* ==================================
                PRESCRIPTION
            ================================== */}

            <section>

              <div className="flex items-start justify-between gap-4">

                <SectionTitle
                  number="04"
                  title="Prescription"
                  description="Add medicines prescribed during this consultation."
                />

                <button
                  type="button"
                  onClick={
                    addMedicine
                  }
                  className="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  + Add Medicine
                </button>

              </div>


              {form.prescription.length === 0 ? (

                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">

                  <p className="text-sm font-medium text-slate-600">
                    No medicines added
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Click "Add Medicine" to create a prescription.
                  </p>

                </div>

              ) : (

                <div className="mt-4 space-y-4">

                  {form.prescription.map(
                    (medicine, index) => (

                      <div
                        key={index}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >

                        <div className="mb-4 flex items-center justify-between">

                          <p className="text-sm font-semibold text-slate-800">
                            Medicine {index + 1}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              removeMedicine(
                                index
                              )
                            }
                            className="text-xs font-semibold text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>

                        </div>


                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                          <Input
                            label="Medicine ID"
                            value={
                              medicine.medicine
                            }
                            onChange={(e) =>
                              handleMedicineChange(
                                index,
                                "medicine",
                                e.target.value
                              )
                            }
                            placeholder="Enter medicine ObjectId"
                          />

                          <Input
                            label="Dosage"
                            value={
                              medicine.dosage
                            }
                            onChange={(e) =>
                              handleMedicineChange(
                                index,
                                "dosage",
                                e.target.value
                              )
                            }
                            placeholder="e.g. 1 tablet"
                          />

                          <Input
                            label="Frequency"
                            value={
                              medicine.frequency
                            }
                            onChange={(e) =>
                              handleMedicineChange(
                                index,
                                "frequency",
                                e.target.value
                              )
                            }
                            placeholder="e.g. 1-0-1"
                          />

                          <Input
                            label="Duration"
                            value={
                              medicine.duration
                            }
                            onChange={(e) =>
                              handleMedicineChange(
                                index,
                                "duration",
                                e.target.value
                              )
                            }
                            placeholder="e.g. 7 days"
                          />

                        </div>


                        <div className="mt-4">

                          <Input
                            label="Instructions"
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
                            placeholder="e.g. After food"
                          />

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </section>


            {/* ==================================
                THERAPY
            ================================== */}

            <section>

              <div className="flex items-start justify-between gap-4">

                <SectionTitle
                  number="05"
                  title="Panchakarma Therapy"
                  description="Add therapies recommended for the patient."
                />

                <button
                  type="button"
                  onClick={
                    addTherapy
                  }
                  className="shrink-0 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  + Add Therapy
                </button>

              </div>


              {form.therapies.length === 0 ? (

                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">

                  <p className="text-sm font-medium text-slate-600">
                    No therapies added
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Add Panchakarma therapy if required.
                  </p>

                </div>

              ) : (

                <div className="mt-4 space-y-4">

                  {form.therapies.map(
                    (therapy, index) => (

                      <div
                        key={index}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >

                        <div className="mb-4 flex items-center justify-between">

                          <p className="text-sm font-semibold text-slate-800">
                            Therapy {index + 1}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              removeTherapy(
                                index
                              )
                            }
                            className="text-xs font-semibold text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>

                        </div>


                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                          <Input
                            label="Therapy"
                            value={
                              therapy.therapy
                            }
                            onChange={(e) =>
                              handleTherapyChange(
                                index,
                                "therapy",
                                e.target.value
                              )
                            }
                            placeholder="e.g. Abhyanga"
                          />

                          <Input
                            label="Therapist ID"
                            value={
                              therapy.therapist
                            }
                            onChange={(e) =>
                              handleTherapyChange(
                                index,
                                "therapist",
                                e.target.value
                              )
                            }
                            placeholder="Staff ObjectId"
                          />

                          <Input
                            label="Sessions"
                            type="number"
                            value={
                              therapy.sessions
                            }
                            onChange={(e) =>
                              handleTherapyChange(
                                index,
                                "sessions",
                                e.target.value
                              )
                            }
                            placeholder="5"
                          />

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </section>


            {/* ==================================
                ADVICE
            ================================== */}

            <section>

              <SectionTitle
                number="06"
                title="Advice & Follow-up"
                description="Provide patient instructions and follow-up information."
              />


              <div className="mt-4 space-y-4">

                <TextArea
                  label="Advice"
                  name="advice"
                  value={
                    form.advice
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Diet, lifestyle and other patient instructions..."
                  rows={5}
                />


                <div className="max-w-sm">

                  <Input
                    label="Follow-up Date"
                    name="followUpDate"
                    type="date"
                    value={
                      form.followUpDate
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </div>

            </section>

          </div>


          {/* ==================================
              FOOTER
          ================================== */}

          <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={
                submitting ||
                loadingAppointments
              }
              className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {submitting ? (
                <span className="flex items-center justify-center gap-2">

                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  Saving Consultation...

                </span>
              ) : (
                "Complete Consultation"
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


// ==========================================
// REUSABLE INPUT
// ==========================================

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  suffix,
  step,
}) {

  return (

    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <div className="relative">

        <input
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          step={step}
          className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 ${
            suffix
              ? "pr-16"
              : ""
          }`}
        />

        {suffix && (

          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
            {suffix}
          </span>

        )}

      </div>

    </div>
  );
}


// ==========================================
// TEXTAREA
// ==========================================

function TextArea({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
}) {

  return (

    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <textarea
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
      />

    </div>
  );
}


// ==========================================
// SECTION TITLE
// ==========================================

function SectionTitle({
  number,
  title,
  description,
}) {

  return (

    <div className="flex items-start gap-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700">
        {number}
      </div>

      <div>

        <h3 className="font-bold text-slate-900">
          {title}
        </h3>

        <p className="mt-0.5 text-xs text-slate-500">
          {description}
        </p>

      </div>

    </div>
  );
}


// ==========================================
// INFO CARD
// ==========================================

function InfoCard({
  label,
  value,
  subValue,
}) {

  return (

    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">

      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-800">
        {value}
      </p>

      {subValue && (

        <p className="mt-1 text-xs text-slate-500">
          {subValue}
        </p>

      )}

    </div>
  );
}  