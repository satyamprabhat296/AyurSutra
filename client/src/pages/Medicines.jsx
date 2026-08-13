import { useEffect, useMemo, useState } from "react";

import {
  getMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from "../services/medicineService";

const categories = [
  "TABLET",
  "CAPSULE",
  "SYRUP",
  "POWDER",
  "OIL",
  "LEHYAM",
  "CHOORNA",
  "GHRITA",
  "VATI",
  "OTHER",
];

const initialForm = {
  medicineName: "",
  genericName: "",
  brand: "",
  category: "TABLET",
  manufacturer: "",
  unit: "Piece",
  purchasePrice: "",
  sellingPrice: "",
  gst: 0,
  currentStock: "",
  minimumStock: 10,
};

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("ALL");

  const [stockFilter, setStockFilter] =
    useState("ALL");

  const [showModal, setShowModal] =
    useState(false);

  const [editingMedicine, setEditingMedicine] =
    useState(null);

  const [form, setForm] =
    useState(initialForm);

  const [deleteId, setDeleteId] =
    useState(null);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMedicines();

      setMedicines(data.medicines || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load medicines."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const stats = useMemo(() => {
    const total = medicines.length;

    const inStock = medicines.filter(
      (medicine) =>
        Number(medicine.currentStock) >
        Number(medicine.minimumStock)
    ).length;

    const lowStock = medicines.filter(
      (medicine) =>
        Number(medicine.currentStock) > 0 &&
        Number(medicine.currentStock) <=
          Number(medicine.minimumStock)
    ).length;

    const outOfStock = medicines.filter(
      (medicine) =>
        Number(medicine.currentStock) === 0
    ).length;

    return {
      total,
      inStock,
      lowStock,
      outOfStock,
    };
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    const value = search
      .trim()
      .toLowerCase();

    return medicines.filter((medicine) => {
      const matchesSearch =
        !value ||
        medicine.medicineName
          ?.toLowerCase()
          .includes(value) ||
        medicine.medicineCode
          ?.toLowerCase()
          .includes(value) ||
        medicine.genericName
          ?.toLowerCase()
          .includes(value) ||
        medicine.brand
          ?.toLowerCase()
          .includes(value);

      const matchesCategory =
        categoryFilter === "ALL" ||
        medicine.category === categoryFilter;

      let matchesStock = true;

      if (stockFilter === "IN_STOCK") {
        matchesStock =
          Number(medicine.currentStock) >
          Number(medicine.minimumStock);
      }

      if (stockFilter === "LOW_STOCK") {
        matchesStock =
          Number(medicine.currentStock) > 0 &&
          Number(medicine.currentStock) <=
            Number(medicine.minimumStock);
      }

      if (stockFilter === "OUT_OF_STOCK") {
        matchesStock =
          Number(medicine.currentStock) === 0;
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStock
      );
    });
  }, [
    medicines,
    search,
    categoryFilter,
    stockFilter,
  ]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setEditingMedicine(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEditModal = (medicine) => {
    setEditingMedicine(medicine);

    setForm({
      medicineName:
        medicine.medicineName || "",
      genericName:
        medicine.genericName || "",
      brand: medicine.brand || "",
      category:
        medicine.category || "TABLET",
      manufacturer:
        medicine.manufacturer || "",
      unit: medicine.unit || "Piece",
      purchasePrice:
        medicine.purchasePrice ?? "",
      sellingPrice:
        medicine.sellingPrice ?? "",
      gst: medicine.gst ?? 0,
      currentStock:
        medicine.currentStock ?? 0,
      minimumStock:
        medicine.minimumStock ?? 10,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingMedicine(null);
    setForm(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        medicineName: form.medicineName.trim(),
        genericName: form.genericName.trim(),
        brand: form.brand.trim(),
        category: form.category,
        manufacturer:
          form.manufacturer.trim(),
        unit: form.unit.trim() || "Piece",
        purchasePrice:
          Number(form.purchasePrice) || 0,
        sellingPrice:
          Number(form.sellingPrice) || 0,
        gst: Number(form.gst) || 0,
        currentStock:
          Number(form.currentStock) || 0,
        minimumStock:
          Number(form.minimumStock) || 0,
      };

      if (editingMedicine) {
        const data = await updateMedicine(
          editingMedicine._id,
          payload
        );

        setMedicines((previous) =>
          previous.map((medicine) =>
            medicine._id ===
            editingMedicine._id
              ? data.medicine
              : medicine
          )
        );
      } else {
        const data =
          await createMedicine(payload);

        setMedicines((previous) => [
          data.medicine,
          ...previous,
        ]);
      }

      closeModal();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to save medicine."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMedicine(deleteId);

      setMedicines((previous) =>
        previous.filter(
          (medicine) =>
            medicine._id !== deleteId
        )
      );

      setDeleteId(null);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to delete medicine."
      );
    }
  };

  const getStockStatus = (medicine) => {
    const stock = Number(
      medicine.currentStock || 0
    );

    const minimum = Number(
      medicine.minimumStock || 0
    );

    if (stock === 0) {
      return {
        label: "Out of Stock",
        className:
          "bg-red-50 text-red-700 ring-red-200",
      };
    }

    if (stock <= minimum) {
      return {
        label: "Low Stock",
        className:
          "bg-amber-50 text-amber-700 ring-amber-200",
      };
    }

    return {
      label: "In Stock",
      className:
        "bg-emerald-50 text-emerald-700 ring-emerald-200",
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="mb-1 text-sm font-medium text-emerald-600">
            Pharmacy Management
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Medicines
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage medicines, pricing and pharmacy stock.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md"
        >
          <span className="text-lg">
            +
          </span>

          Add Medicine
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            onClick={() => setError("")}
            className="font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Medicines"
          value={stats.total}
          icon="💊"
        />

        <StatCard
          title="In Stock"
          value={stats.inStock}
          icon="✓"
        />

        <StatCard
          title="Low Stock"
          value={stats.lowStock}
          icon="⚠"
        />

        <StatCard
          title="Out of Stock"
          value={stats.outOfStock}
          icon="!"
        />
      </div>

      {/* Main Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* Filters */}
        <div className="border-b border-slate-200 p-4 sm:p-5">

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search medicine..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="ALL">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(event) =>
                setStockFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="ALL">
                All Stock
              </option>

              <option value="IN_STOCK">
                In Stock
              </option>

              <option value="LOW_STOCK">
                Low Stock
              </option>

              <option value="OUT_OF_STOCK">
                Out of Stock
              </option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">

          {loading ? (
            <LoadingState />
          ) : filteredMedicines.length === 0 ? (
            <EmptyState
              onAdd={openAddModal}
            />
          ) : (
            <table className="min-w-[1000px] w-full">

              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">

                  <th className="px-5 py-4">
                    Medicine
                  </th>

                  <th className="px-5 py-4">
                    Category
                  </th>

                  <th className="px-5 py-4">
                    Manufacturer
                  </th>

                  <th className="px-5 py-4">
                    Stock
                  </th>

                  <th className="px-5 py-4">
                    Selling Price
                  </th>

                  <th className="px-5 py-4">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredMedicines.map(
                  (medicine) => {
                    const status =
                      getStockStatus(
                        medicine
                      );

                    return (
                      <tr
                        key={medicine._id}
                        className="transition hover:bg-slate-50"
                      >

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg">
                              💊
                            </div>

                            <div>
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
                            </div>

                          </div>

                        </td>

                        <td className="px-5 py-4">

                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {medicine.category ||
                              "OTHER"}
                          </span>

                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {medicine.manufacturer ||
                            "—"}
                        </td>

                        <td className="px-5 py-4">

                          <p className="font-semibold text-slate-800">
                            {
                              medicine.currentStock
                            }{" "}
                            <span className="text-xs font-normal text-slate-400">
                              {medicine.unit}
                            </span>
                          </p>

                          <p className="text-xs text-slate-400">
                            Min:{" "}
                            {
                              medicine.minimumStock
                            }
                          </p>

                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-800">
                          ₹
                          {Number(
                            medicine.sellingPrice || 0
                          ).toFixed(2)}
                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${status.className}`}
                          >
                            {status.label}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              onClick={() =>
                                openEditModal(
                                  medicine
                                )
                              }
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() =>
                                setDeleteId(
                                  medicine._id
                                )
                              }
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>
            </table>
          )}

        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingMedicine
                    ? "Edit Medicine"
                    : "Add Medicine"}
                </h2>

                <p className="text-xs text-slate-500">
                  {editingMedicine
                    ? "Update medicine information"
                    : "Add a new medicine to your inventory"}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6"
            >

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <Input
                  label="Medicine Name"
                  name="medicineName"
                  value={form.medicineName}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Generic Name"
                  name="genericName"
                  value={form.genericName}
                  onChange={handleChange}
                />

                <Input
                  label="Brand"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                />

                <Select
                  label="Category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  options={categories}
                />

                <Input
                  label="Manufacturer"
                  name="manufacturer"
                  value={form.manufacturer}
                  onChange={handleChange}
                />

                <Input
                  label="Unit"
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                />

                <Input
                  label="Purchase Price"
                  name="purchasePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.purchasePrice}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Selling Price"
                  name="sellingPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.sellingPrice}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="GST (%)"
                  name="gst"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.gst}
                  onChange={handleChange}
                />

                <Input
                  label="Current Stock"
                  name="currentStock"
                  type="number"
                  min="0"
                  value={form.currentStock}
                  onChange={handleChange}
                />

                <Input
                  label="Minimum Stock"
                  name="minimumStock"
                  type="number"
                  min="0"
                  value={form.minimumStock}
                  onChange={handleChange}
                />

              </div>

              <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">

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
                  className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingMedicine
                    ? "Update Medicine"
                    : "Add Medicine"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl">
              ⚠️
            </div>

            <h2 className="text-lg font-bold text-slate-900">
              Delete medicine?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This will permanently remove this
              medicine from the database.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() => setDeleteId(null)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

/* -------------------------------- */
/* Reusable Components */
/* -------------------------------- */

const StatCard = ({
  title,
  value,
  icon,
}) => {
  return (
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
};

const Input = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  min,
  step,
}) => {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        required={required}
        min={min}
        step={step}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
      />
    </div>
  );
};

const Select = ({
  label,
  name,
  value,
  onChange,
  options,
}) => {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

const LoadingState = () => {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="text-center">

        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

        <p className="mt-4 text-sm text-slate-500">
          Loading medicines...
        </p>

      </div>
    </div>
  );
};

const EmptyState = ({
  onAdd,
}) => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
        💊
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">
        No medicines found
      </h3>

      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Add your first medicine or adjust
        your search filters.
      </p>

      <button
        onClick={onAdd}
        className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Add Medicine
      </button>

    </div>
  );
};

export default Medicines;