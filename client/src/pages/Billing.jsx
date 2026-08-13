import { useEffect, useMemo, useState } from "react";
import {
  getBills,
  createBill,
  markBillPaid,
  getBillPDF,
} from "../services/billingService";

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  const [selectedBill, setSelectedBill] =
    useState(null);

  const [saving, setSaving] = useState(false);

  const [formError, setFormError] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("CASH");

  const [formData, setFormData] = useState({
    patient: "",
    appointment: "",
    consultation: "",
    discount: 0,
    tax: 0,
    paymentMethod: "CASH",
    notes: "",
  });

  const [items, setItems] = useState([
    {
      name: "",
      category: "CONSULTATION",
      quantity: 1,
      price: 0,
    },
  ]);

  // ==========================================
  // LOAD BILLS
  // ==========================================

  const loadBills = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getBills();

      setBills(data?.bills || []);
    } catch (err) {
      console.error("Failed to load bills:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load bills."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredBills = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return bills;
    }

    return bills.filter((bill) => {
      const invoice =
        bill?.invoiceNumber?.toLowerCase() || "";

      const patientId =
        bill?.patient?.patientId?.toLowerCase() || "";

      const patientName =
        getPatientName(bill).toLowerCase();

      return (
        invoice.includes(value) ||
        patientId.includes(value) ||
        patientName.includes(value)
      );
    });
  }, [bills, search]);

  // ==========================================
  // FORM HANDLERS
  // ==========================================

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    setItems((previous) =>
      previous.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        return {
          ...item,
          [field]: value,
        };
      })
    );
  };

  const addItem = () => {
    setItems((previous) => [
      ...previous,
      {
        name: "",
        category: "CONSULTATION",
        quantity: 1,
        price: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems((previous) =>
      previous.filter(
        (_, itemIndex) => itemIndex !== index
      )
    );
  };

  // ==========================================
  // FRONTEND PREVIEW CALCULATION
  // ==========================================

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const quantity =
        Number(item.quantity) || 0;

      const price =
        Number(item.price) || 0;

      return sum + quantity * price;
    }, 0);
  }, [items]);

  const discount = Number(formData.discount) || 0;
  const tax = Number(formData.tax) || 0;

  const total = Math.max(
    0,
    subtotal - discount + tax
  );

  // ==========================================
  // CREATE BILL
  // ==========================================

  const handleCreateBill = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setFormError("");

      if (!formData.patient.trim()) {
        setFormError("Patient ID is required.");
        return;
      }

      const validItems = items
        .filter((item) => item.name.trim())
        .map((item) => {
          const quantity =
            Number(item.quantity) || 1;

          const price =
            Number(item.price) || 0;

          return {
            name: item.name.trim(),
            category: item.category,
            quantity,
            price,
            amount: quantity * price,
          };
        });

      if (validItems.length === 0) {
        setFormError(
          "At least one billing item is required."
        );
        return;
      }

      const payload = {
        patient: formData.patient.trim(),
        items: validItems,
        discount,
        tax,
        paymentMethod:
          formData.paymentMethod,
        notes: formData.notes.trim(),
      };

      if (formData.appointment.trim()) {
        payload.appointment =
          formData.appointment.trim();
      }

      if (formData.consultation.trim()) {
        payload.consultation =
          formData.consultation.trim();
      }

      const response = await createBill(payload);

      if (response?.bill) {
        setBills((previous) => [
          response.bill,
          ...previous,
        ]);
      } else {
        await loadBills();
      }

      resetForm();
      setShowCreateModal(false);
    } catch (err) {
      console.error("Create bill error:", err);

      setFormError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create bill."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // MARK PAID
  // ==========================================

  const openPaymentModal = (bill) => {
    setSelectedBill(bill);

    setPaymentMethod(
      bill?.paymentMethod || "CASH"
    );

    setShowPaymentModal(true);
  };

  const handleMarkPaid = async () => {
    if (!selectedBill?._id) {
      return;
    }

    try {
      setSaving(true);

      const response = await markBillPaid(
        selectedBill._id,
        paymentMethod
      );

      if (response?.bill) {
        setBills((previous) =>
          previous.map((bill) =>
            bill._id === response.bill._id
              ? response.bill
              : bill
          )
        );
      } else {
        await loadBills();
      }

      setShowPaymentModal(false);
      setSelectedBill(null);
    } catch (err) {
      console.error(
        "Payment update error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to update payment."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // PDF
  // ==========================================

  const handleDownloadPDF = async (bill) => {
    try {
      const response = await getBillPDF(
        bill._id
      );

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      const url = window.URL.createObjectURL(
        blob
      );

      const link =
        document.createElement("a");

      link.href = url;

      link.download = `${
        bill.invoiceNumber ||
        "invoice"
      }.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(
        "PDF generation error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to generate invoice PDF."
      );
    }
  };

  // ==========================================
  // RESET
  // ==========================================

  const resetForm = () => {
    setFormData({
      patient: "",
      appointment: "",
      consultation: "",
      discount: 0,
      tax: 0,
      paymentMethod: "CASH",
      notes: "",
    });

    setItems([
      {
        name: "",
        category: "CONSULTATION",
        quantity: 1,
        price: 0,
      },
    ]);

    setFormError("");
  };

  // ==========================================
  // HELPERS
  // ==========================================

  function getPatientName(bill) {
    const patient = bill?.patient;

    if (!patient) {
      return "Unknown Patient";
    }

    if (typeof patient === "string") {
      return patient;
    }

    const firstName =
      patient?.basicInfo?.firstName || "";

    const lastName =
      patient?.basicInfo?.lastName || "";

    return (
      patient?.fullName ||
      `${firstName} ${lastName}`.trim() ||
      patient?.patientId ||
      "Unknown Patient"
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">

          <div className="mb-8">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />

            <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl bg-white"
              />
            ))}
          </div>

          <div className="mt-6 h-96 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Billing
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage invoices, payments and patient billing.
            </p>
          </div>

          <div className="flex gap-3">

            <button
              type="button"
              onClick={loadBills}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              ↻ Refresh
            </button>

            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              + Create Bill
            </button>

          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SUMMARY */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Bills
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {bills.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Paid
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {
                bills.filter(
                  (bill) =>
                    bill.paymentStatus ===
                    "PAID"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-600">
              {
                bills.filter(
                  (bill) =>
                    bill.paymentStatus ===
                    "PENDING"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Revenue
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatCurrency(
                bills
                  .filter(
                    (bill) =>
                      bill.paymentStatus ===
                      "PAID"
                  )
                  .reduce(
                    (sum, bill) =>
                      sum +
                      Number(
                        bill.total || 0
                      ),
                    0
                  )
              )}
            </p>
          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Invoices
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View and manage generated bills.
              </p>
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search invoice or patient..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 sm:w-80"
            />

          </div>

          {filteredBills.length === 0 ? (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl">
                ₹
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                No bills found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Create your first patient invoice to see it here.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Invoice
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Patient
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredBills.map((bill) => (

                    <tr
                      key={bill._id}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-6 py-4">

                        <p className="font-semibold text-slate-900">
                          {bill.invoiceNumber}
                        </p>

                        <p className="text-xs text-slate-500">
                          {bill.paymentMethod}
                        </p>

                      </td>

                      <td className="px-6 py-4">

                        <p className="font-semibold text-slate-800">
                          {getPatientName(bill)}
                        </p>

                        <p className="text-xs text-slate-500">
                          {bill?.patient?.patientId ||
                            "Patient"}
                        </p>

                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(
                          bill.createdAt
                        )}
                      </td>

                      <td className="px-6 py-4">

                        <p className="font-bold text-slate-900">
                          {formatCurrency(
                            bill.total
                          )}
                        </p>

                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            bill.paymentStatus ===
                            "PAID"
                              ? "bg-emerald-50 text-emerald-700"
                              : bill.paymentStatus ===
                                "PARTIAL"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {bill.paymentStatus}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          {bill.paymentStatus !==
                            "PAID" && (
                            <button
                              type="button"
                              onClick={() =>
                                openPaymentModal(
                                  bill
                                )
                              }
                              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                            >
                              Mark Paid
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadPDF(
                                bill
                              )
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            PDF
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

      {/* ==========================================
          CREATE BILL MODAL
      ========================================== */}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 p-6">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Create Bill
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Generate a new patient invoice.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreateModal(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-slate-100"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleCreateBill}
              className="space-y-6 p-6"
            >

              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              {/* REFERENCES */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Patient ID *
                  </label>

                  <input
                    name="patient"
                    value={formData.patient}
                    onChange={handleFormChange}
                    placeholder="MongoDB Patient ID"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Appointment ID
                  </label>

                  <input
                    name="appointment"
                    value={
                      formData.appointment
                    }
                    onChange={handleFormChange}
                    placeholder="Optional"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Consultation ID
                  </label>

                  <input
                    name="consultation"
                    value={
                      formData.consultation
                    }
                    onChange={handleFormChange}
                    placeholder="Optional"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

              </div>

              {/* ITEMS */}

              <div>

                <div className="mb-3 flex items-center justify-between">

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Billing Items
                    </h3>

                    <p className="text-xs text-slate-500">
                      Add consultation, therapy, medicine or other charges.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addItem}
                    className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    + Add Item
                  </button>

                </div>

                <div className="space-y-3">

                  {items.map(
                    (item, index) => (

                      <div
                        key={index}
                        className="grid grid-cols-12 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                      >

                        <div className="col-span-12 md:col-span-4">

                          <input
                            value={item.name}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Item name"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                          />

                        </div>

                        <div className="col-span-6 md:col-span-3">

                          <select
                            value={
                              item.category
                            }
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "category",
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                          >

                            <option value="CONSULTATION">
                              Consultation
                            </option>

                            <option value="THERAPY">
                              Therapy
                            </option>

                            <option value="MEDICINE">
                              Medicine
                            </option>

                            <option value="LAB">
                              Lab
                            </option>

                            <option value="OTHER">
                              Other
                            </option>

                          </select>

                        </div>

                        <div className="col-span-3 md:col-span-2">

                          <input
                            type="number"
                            min="1"
                            value={
                              item.quantity
                            }
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                          />

                        </div>

                        <div className="col-span-6 md:col-span-2">

                          <input
                            type="number"
                            min="0"
                            value={item.price}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "price",
                                e.target.value
                              )
                            }
                            placeholder="Price"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                          />

                        </div>

                        <div className="col-span-3 flex items-center justify-center md:col-span-1">

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                index
                              )
                            }
                            className="rounded-lg px-2 py-2 text-red-500 hover:bg-red-50"
                          >
                            ×
                          </button>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

              {/* TOTALS */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div className="space-y-4">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Discount
                    </label>

                    <input
                      type="number"
                      min="0"
                      name="discount"
                      value={
                        formData.discount
                      }
                      onChange={
                        handleFormChange
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Tax
                    </label>

                    <input
                      type="number"
                      min="0"
                      name="tax"
                      value={formData.tax}
                      onChange={
                        handleFormChange
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Payment Method
                    </label>

                    <select
                      name="paymentMethod"
                      value={
                        formData.paymentMethod
                      }
                      onChange={
                        handleFormChange
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    >
                      <option value="CASH">
                        Cash
                      </option>

                      <option value="UPI">
                        UPI
                      </option>

                      <option value="CARD">
                        Card
                      </option>

                      <option value="BANK_TRANSFER">
                        Bank Transfer
                      </option>
                    </select>
                  </div>

                </div>

                <div className="rounded-2xl bg-slate-900 p-5 text-white">

                  <div className="flex justify-between py-2 text-sm text-slate-300">
                    <span>Subtotal</span>
                    <span>
                      {formatCurrency(
                        subtotal
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 text-sm text-slate-300">
                    <span>Discount</span>
                    <span>
                      -{" "}
                      {formatCurrency(
                        discount
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 text-sm text-slate-300">
                    <span>Tax</span>
                    <span>
                      {formatCurrency(tax)}
                    </span>
                  </div>

                  <div className="my-3 border-t border-slate-700" />

                  <div className="flex justify-between">
                    <span className="font-bold">
                      Total
                    </span>

                    <span className="text-2xl font-bold text-emerald-400">
                      {formatCurrency(total)}
                    </span>
                  </div>

                </div>

              </div>

              {/* NOTES */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows="3"
                  placeholder="Additional billing notes..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">

                <button
                  type="button"
                  onClick={() =>
                    setShowCreateModal(false)
                  }
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {saving
                    ? "Generating..."
                    : "Generate Bill"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ==========================================
          PAYMENT MODAL
      ========================================== */}

      {showPaymentModal &&
        selectedBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

              <div className="border-b border-slate-200 p-6">

                <h2 className="text-xl font-bold text-slate-900">
                  Receive Payment
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedBill.invoiceNumber}
                </p>

              </div>

              <div className="space-y-5 p-6">

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-sm text-slate-500">
                    Amount Due
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {formatCurrency(
                      selectedBill.total
                    )}
                  </p>

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Payment Method
                  </label>

                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  >

                    <option value="CASH">
                      Cash
                    </option>

                    <option value="UPI">
                      UPI
                    </option>

                    <option value="CARD">
                      Card
                    </option>

                    <option value="BANK_TRANSFER">
                      Bank Transfer
                    </option>

                  </select>

                </div>

                <div className="flex justify-end gap-3">

                  <button
                    type="button"
                    onClick={() => {
                      setShowPaymentModal(false);
                      setSelectedBill(null);
                    }}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleMarkPaid}
                    className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {saving
                      ? "Processing..."
                      : "Confirm Payment"}
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

    </div>
  );
};

export default Billing;