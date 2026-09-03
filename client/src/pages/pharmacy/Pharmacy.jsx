import { useEffect, useState } from "react";

import {
  getPharmacyPrescriptions,
  getPharmacyMedicines,
  issuePrescription,
} from "../../services/pharmacyService";

const Pharmacy = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);

  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        prescriptionResponse,
        medicineResponse,
      ] = await Promise.all([
        getPharmacyPrescriptions(),
        getPharmacyMedicines(),
      ]);

      setPrescriptions(
        prescriptionResponse.prescriptions || []
      );

      setMedicines(
        medicineResponse.medicines || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load pharmacy data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssue = async (prescriptionId) => {
    try {
      setIssuing(prescriptionId);
      setError("");
      setSuccess("");

      const response =
        await issuePrescription(
          prescriptionId
        );

      setSuccess(
        response.message ||
          "Medicines issued successfully"
      );

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to issue medicines"
      );
    } finally {
      setIssuing(null);
    }
  };

  const lowStockMedicines =
    medicines.filter(
      (medicine) =>
        medicine.currentStock <=
        medicine.minimumStock
    );

  const activePrescriptions =
    prescriptions.filter(
      (prescription) =>
        prescription.status === "ACTIVE"
    );

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading pharmacy...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Pharmacy
        </h1>

        <p className="mt-1 text-gray-500">
          Manage prescriptions, medicines and
          inventory.
        </p>
      </div>

      {/* Alerts */}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          {success}
        </div>
      )}

      {/* Statistics */}

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Active Prescriptions
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {activePrescriptions.length}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Medicines
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-800">
            {medicines.length}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Low Stock Medicines
          </p>

          <h2 className="mt-2 text-3xl font-bold text-red-600">
            {lowStockMedicines.length}
          </h2>
        </div>

      </div>

      {/* Prescription Queue */}

      <div className="mb-8 rounded-xl bg-white shadow-sm">

        <div className="border-b p-5">
          <h2 className="text-xl font-semibold text-gray-800">
            Prescription Queue
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Prescriptions waiting for medicine
            issue.
          </p>
        </div>

        {activePrescriptions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No pending prescriptions.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-sm font-medium text-gray-600">
                    Prescription
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-medium text-gray-600">
                    Patient
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-medium text-gray-600">
                    Doctor
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-medium text-gray-600">
                    Medicines
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-medium text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">

                {activePrescriptions.map(
                  (prescription) => (
                    <tr
                      key={prescription._id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-5 py-4 font-medium text-gray-800">
                        {
                          prescription.prescriptionNumber
                        }
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-800">
                          {prescription.patient
                            ?.basicInfo
                            ?.firstName || ""}{" "}
                          {prescription.patient
                            ?.basicInfo
                            ?.lastName || ""}
                        </div>

                        <div className="text-sm text-gray-500">
                          {
                            prescription.patient
                              ?.patientId
                          }
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-800">
                          {
                            prescription.doctor
                              ?.name
                          }
                        </div>

                        <div className="text-sm text-gray-500">
                          {
                            prescription.doctor
                              ?.specialization
                          }
                        </div>
                      </td>

                      <td className="px-5 py-4">

                        <div className="space-y-1">

                          {prescription.items?.map(
                            (item, index) => (
                              <div
                                key={index}
                                className="text-sm"
                              >
                                <span className="font-medium">
                                  {
                                    item.medicineName
                                  }
                                </span>

                                <span className="text-gray-500">
                                  {" "}
                                  ×{" "}
                                  {
                                    item.quantity
                                  }
                                </span>
                              </div>
                            )
                          )}

                        </div>

                      </td>

                      <td className="px-5 py-4">

                        <button
                          onClick={() =>
                            handleIssue(
                              prescription._id
                            )
                          }
                          disabled={
                            issuing ===
                            prescription._id
                          }
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {issuing ===
                          prescription._id
                            ? "Issuing..."
                            : "Issue Medicines"}
                        </button>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* Low Stock */}

      <div className="rounded-xl bg-white shadow-sm">

        <div className="border-b p-5">
          <h2 className="text-xl font-semibold text-gray-800">
            Low Stock Alerts
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Medicines that need replenishment.
          </p>
        </div>

        {lowStockMedicines.length === 0 ? (
          <div className="p-8 text-center text-green-600">
            All medicines have sufficient stock.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50">
                <tr>

                  <th className="px-5 py-3 text-left text-sm font-medium text-gray-600">
                    Medicine
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-medium text-gray-600">
                    Code
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-medium text-gray-600">
                    Current Stock
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-medium text-gray-600">
                    Minimum Stock
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y">

                {lowStockMedicines.map(
                  (medicine) => (
                    <tr
                      key={medicine._id}
                    >

                      <td className="px-5 py-4 font-medium text-gray-800">
                        {
                          medicine.medicineName
                        }
                      </td>

                      <td className="px-5 py-4 text-gray-500">
                        {
                          medicine.medicineCode
                        }
                      </td>

                      <td className="px-5 py-4 font-semibold text-red-600">
                        {
                          medicine.currentStock
                        }
                      </td>

                      <td className="px-5 py-4">
                        {
                          medicine.minimumStock
                        }
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
  );
};

export default Pharmacy;