import { useEffect, useMemo, useState } from "react";

import {
  getInventoryHistory,
  createInventoryTransaction,
} from "../services/inventoryService";

import { getMedicines } from "../services/medicineService";

const transactionTypes = [
  "PURCHASE",
  "ISSUE",
  "RETURN",
  "DAMAGE",
  "EXPIRED",
  "ADJUSTMENT",
];

const initialForm = {
  medicine: "",
  transactionType: "PURCHASE",
  quantity: "",
  batchNumber: "",
  expiryDate: "",
  supplier: "",
  remarks: "",
};

const Inventory = () => {
  const [history, setHistory] = useState([]);
  const [medicines, setMedicines] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] =
    useState("ALL");

  const [showModal, setShowModal] =
    useState(false);

  const [form, setForm] =
    useState(initialForm);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [inventoryData, medicineData] =
        await Promise.all([
          getInventoryHistory(),
          getMedicines(),
        ]);

      setHistory(
        inventoryData.history || []
      );

      setMedicines(
        medicineData.medicines || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load inventory."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stockStats = useMemo(() => {
    const totalItems = medicines.length;

    const totalStock = medicines.reduce(
      (sum, medicine) =>
        sum +
        Number(medicine.currentStock || 0),
      0
    );

    const lowStock = medicines.filter(
      (medicine) =>
        Number(medicine.currentStock || 0) >
          0 &&
        Number(medicine.currentStock || 0) <=
          Number(medicine.minimumStock || 0)
    ).length;

    const outOfStock = medicines.filter(
      (medicine) =>
        Number(medicine.currentStock || 0) === 0
    ).length;

    return {
      totalItems,
      totalStock,
      lowStock,
      outOfStock,
    };
  }, [medicines]);

  const filteredHistory = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    return history.filter((transaction) => {
      const medicine =
        transaction.medicine;

      const matchesSearch =
        !value ||
        medicine?.medicineName
          ?.toLowerCase()
          .includes(value) ||
        medicine?.medicineCode
          ?.toLowerCase()
          .includes(value) ||
        transaction.batchNumber
          ?.toLowerCase()
          .includes(value) ||
        transaction.supplier
          ?.toLowerCase()
          .includes(value);

      const matchesType =
        typeFilter === "ALL" ||
        transaction.transactionType ===
          typeFilter;

      return (
        matchesSearch &&
        matchesType
      );
    });
  }, [
    history,
    search,
    typeFilter,
  ]);

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openModal = () => {
    setForm(initialForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setForm(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.medicine) {
        setError("Please select a medicine.");
        return;
      }

      const quantity = Number(
        form.quantity
      );

      if (
        !Number.isFinite(quantity) ||
        quantity < 1
      ) {
        setError(
          "Quantity must be at least 1."
        );
        return;
      }

      const selectedMedicine =
        medicines.find(
          (medicine) =>
            medicine._id ===
            form.medicine
        );

      if (!selectedMedicine) {
        setError("Medicine not found.");
        return;
      }

      const currentStock = Number(
        selectedMedicine.currentStock || 0
      );

      if (
        [
          "ISSUE",
          "DAMAGE",
          "EXPIRED",
        ].includes(form.transactionType) &&
        currentStock < quantity
      ) {
        setError(
          `Insufficient stock. Available stock: ${currentStock}.`
        );
        return;
      }

      const payload = {
        medicine: form.medicine,
        transactionType:
          form.transactionType,
        quantity,

        batchNumber:
          form.batchNumber.trim(),

        supplier:
          form.supplier.trim(),

        remarks:
          form.remarks.trim(),
      };

      if (form.expiryDate) {
        payload.expiryDate =
          form.expiryDate;
      }

      const data =
        await createInventoryTransaction(
          payload
        );

      setHistory((previous) => [
        data.transaction,
        ...previous,
      ]);

      /*
       * Refresh medicines because the backend
       * updates Medicine.currentStock.
       */
      const medicineData =
        await getMedicines();

      setMedicines(
        medicineData.medicines || []
      );

      setSuccess(
        "Inventory updated successfully."
      );

      setForm(initialForm);

      setTimeout(() => {
        setShowModal(false);
        setSuccess("");
      }, 700);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to update inventory."
      );
    } finally {
      setSaving(false);
    }
  };

  const getTransactionStyle = (
    type
  ) => {
    switch (type) {
      case "PURCHASE":
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";

      case "RETURN":
        return "bg-blue-50 text-blue-700 ring-blue-200";

      case "ISSUE":
        return "bg-orange-50 text-orange-700 ring-orange-200";

      case "DAMAGE":
        return "bg-red-50 text-red-700 ring-red-200";

      case "EXPIRED":
        return "bg-red-50 text-red-700 ring-red-200";

      case "ADJUSTMENT":
        return "bg-purple-50 text-purple-700 ring-purple-200";

      default:
        return "bg-slate-50 text-slate-700 ring-slate-200";
    }
  };

  const isStockIncrease = (type) =>
    ["PURCHASE", "RETURN"].includes(
      type
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="mb-1 text-sm font-medium text-emerald-600">
            Pharmacy Management
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Inventory
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage medicine stock and inventory transactions.
          </p>
        </div>

        <button
          onClick={openModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <span className="text-lg">
            +
          </span>

          Stock Transaction
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            onClick={() => setError("")}
            className="font-bold"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Medicines"
          value={stockStats.totalItems}
          icon="💊"
        />

        <StatCard
          title="Total Stock"
          value={stockStats.totalStock}
          icon="📦"
        />

        <StatCard
          title="Low Stock"
          value={stockStats.lowStock}
          icon="⚠️"
        />

        <StatCard
          title="Out of Stock"
          value={stockStats.outOfStock}
          icon="🚫"
        />

      </div>

      {/* Current Stock */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-5 py-4">

          <h2 className="font-semibold text-slate-900">
            Current Stock
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Current medicine availability
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-[850px] w-full">

            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">

                <th className="px-5 py-4">
                  Medicine
                </th>

                <th className="px-5 py-4">
                  Category
                </th>

                <th className="px-5 py-4">
                  Current Stock
                </th>

                <th className="px-5 py-4">
                  Minimum
                </th>

                <th className="px-5 py-4">
                  Status
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {medicines.map(
                (medicine) => {

                  const stock = Number(
                    medicine.currentStock || 0
                  );

                  const minimum = Number(
                    medicine.minimumStock || 0
                  );

                  let status =
                    "In Stock";

                  let statusClass =
                    "bg-emerald-50 text-emerald-700 ring-emerald-200";

                  if (stock === 0) {
                    status =
                      "Out of Stock";

                    statusClass =
                      "bg-red-50 text-red-700 ring-red-200";
                  } else if (
                    stock <= minimum
                  ) {
                    status =
                      "Low Stock";

                    statusClass =
                      "bg-amber-50 text-amber-700 ring-amber-200";
                  }

                  return (
                    <tr
                      key={medicine._id}
                      className="hover:bg-slate-50"
                    >

                      <td className="px-5 py-4">

                        <p className="font-semibold text-slate-900">
                          {
                            medicine.medicineName
                          }
                        </p>

                        <p className="text-xs text-slate-400">
                          {
                            medicine.medicineCode
                          }
                        </p>

                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {medicine.category ||
                          "OTHER"}
                      </td>

                      <td className="px-5 py-4">

                        <span className="font-bold text-slate-900">
                          {stock}
                        </span>

                        <span className="ml-1 text-xs text-slate-400">
                          {medicine.unit}
                        </span>

                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {minimum}
                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass}`}
                        >
                          {status}
                        </span>

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

          {!loading &&
            medicines.length === 0 && (
              <div className="py-16 text-center text-sm text-slate-500">
                No medicines found.
              </div>
            )}

        </div>
      </div>

      {/* Transaction History */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 p-4 sm:p-5">

          <div className="mb-4">
            <h2 className="font-semibold text-slate-900">
              Transaction History
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Complete inventory movement history
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search medicine, batch or supplier..."
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="ALL">
                All Transactions
              </option>

              {transactionTypes.map(
                (type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                )
              )}
            </select>

          </div>
        </div>

        <div className="overflow-x-auto">

          {loading ? (
            <LoadingState />
          ) : (
            <table className="min-w-[1000px] w-full">

              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">

                  <th className="px-5 py-4">
                    Medicine
                  </th>

                  <th className="px-5 py-4">
                    Transaction
                  </th>

                  <th className="px-5 py-4">
                    Quantity
                  </th>

                  <th className="px-5 py-4">
                    Batch
                  </th>

                  <th className="px-5 py-4">
                    Supplier
                  </th>

                  <th className="px-5 py-4">
                    Date
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredHistory.map(
                  (transaction) => {

                    const type =
                      transaction.transactionType;

                    return (
                      <tr
                        key={transaction._id}
                        className="hover:bg-slate-50"
                      >

                        <td className="px-5 py-4">

                          <p className="font-semibold text-slate-900">
                            {
                              transaction
                                .medicine
                                ?.medicineName ||
                              "Unknown"
                            }
                          </p>

                          <p className="text-xs text-slate-400">
                            {
                              transaction
                                .medicine
                                ?.medicineCode ||
                              "—"
                            }
                          </p>

                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getTransactionStyle(
                              type
                            )}`}
                          >
                            {type}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`font-bold ${
                              isStockIncrease(
                                type
                              )
                                ? "text-emerald-600"
                                : type ===
                                  "ADJUSTMENT"
                                ? "text-purple-600"
                                : "text-red-600"
                            }`}
                          >
                            {isStockIncrease(
                              type
                            )
                              ? "+"
                              : type ===
                                "ADJUSTMENT"
                              ? "="
                              : "-"}
                            {
                              transaction.quantity
                            }
                          </span>

                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {
                            transaction.batchNumber ||
                            "—"
                          }
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {
                            transaction.supplier ||
                            "—"
                          }
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {transaction.createdAt
                            ? new Date(
                                transaction.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "—"}
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>
            </table>
          )}

          {!loading &&
            filteredHistory.length === 0 && (
              <div className="py-16 text-center">

                <div className="text-3xl">
                  📦
                </div>

                <p className="mt-3 font-medium text-slate-700">
                  No transactions found
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Try changing your search or filter.
                </p>

              </div>
            )}

        </div>
      </div>

      {/* Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">

              <div>
                <h2 className="font-bold text-slate-900">
                  Stock Transaction
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Update medicine inventory
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-xl text-slate-400 hover:bg-slate-100"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Medicine *
                  </label>

                  <select
                    name="medicine"
                    value={form.medicine}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="">
                      Select medicine
                    </option>

                    {medicines.map(
                      (medicine) => (
                        <option
                          key={medicine._id}
                          value={medicine._id}
                        >
                          {
                            medicine.medicineName
                          }{" "}
                          —{" "}
                          {
                            medicine.medicineCode
                          }{" "}
                          (Stock:{" "}
                          {
                            medicine.currentStock
                          })
                        </option>
                      )
                    )}

                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Transaction Type *
                  </label>

                  <select
                    name="transactionType"
                    value={
                      form.transactionType
                    }
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  >
                    {transactionTypes.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Quantity *
                  </label>

                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Batch Number
                  </label>

                  <input
                    name="batchNumber"
                    value={form.batchNumber}
                    onChange={handleChange}
                    placeholder="e.g. BATCH-001"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Expiry Date
                  </label>

                  <input
                    name="expiryDate"
                    type="date"
                    value={form.expiryDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Supplier
                  </label>

                  <input
                    name="supplier"
                    value={form.supplier}
                    onChange={handleChange}
                    placeholder="Supplier name"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div className="md:col-span-2">

                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Remarks
                  </label>

                  <textarea
                    name="remarks"
                    value={form.remarks}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Additional information..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />

                </div>

              </div>

              {/* Selected medicine preview */}
              {form.medicine && (
                <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4">

                  {(() => {
                    const medicine =
                      medicines.find(
                        (item) =>
                          item._id ===
                          form.medicine
                      );

                    if (!medicine)
                      return null;

                    return (
                      <div className="flex items-center justify-between">

                        <div>
                          <p className="font-semibold text-emerald-900">
                            {
                              medicine.medicineName
                            }
                          </p>

                          <p className="text-xs text-emerald-700">
                            Current stock:{" "}
                            {
                              medicine.currentStock
                            }{" "}
                            {
                              medicine.unit
                            }
                          </p>
                        </div>

                        <div className="text-right">

                          <p className="text-xs text-emerald-600">
                            Transaction
                          </p>

                          <p className="font-bold text-emerald-900">
                            {
                              form.transactionType
                            }
                          </p>

                        </div>

                      </div>
                    );
                  })()}

                </div>
              )}

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {saving
                    ? "Updating..."
                    : "Update Stock"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

/* ----------------------------- */
/* Components */
/* ----------------------------- */

const StatCard = ({
  title,
  value,
  icon,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

    <div className="flex items-center justify-between">

      <div>
        <p className="text-sm text-slate-500">
          {title}
        </p>

        <p className="mt-2 text-2xl font-bold text-slate-900">
          {value}
        </p>
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-lg">
        {icon}
      </div>

    </div>

  </div>
);

const LoadingState = () => (
  <div className="flex min-h-[220px] items-center justify-center">

    <div className="text-center">

      <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

      <p className="mt-3 text-sm text-slate-500">
        Loading inventory...
      </p>

    </div>

  </div>
);

export default Inventory;