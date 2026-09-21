import { useEffect, useState } from "react";
import {
  IndianRupee,
  CalendarDays,
  Stethoscope,
  Pill,
  AlertTriangle,
  ShoppingCart,
  FileText,
  RefreshCw,
} from "lucide-react";

import {
  getReportSummary,
  getRevenueReport,
  getAppointmentReport,
  getPharmacyReport,
} from "../../services/reportService";

const Reports = () => {
  const today = new Date().toISOString().split("T")[0];

  const firstDay = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  )
    .toISOString()
    .split("T")[0];

  const [from, setFrom] = useState(firstDay);
  const [to, setTo] = useState(today);

  const [summary, setSummary] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [pharmacy, setPharmacy] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        summaryResponse,
        revenueResponse,
        appointmentResponse,
        pharmacyResponse,
      ] = await Promise.all([
        getReportSummary(from, to),
        getRevenueReport(from, to),
        getAppointmentReport(from, to),
        getPharmacyReport(from, to),
      ]);

      setSummary(summaryResponse.summary);
      setRevenue(revenueResponse.revenue || []);
      setAppointments(appointmentResponse.appointments || []);
      setPharmacy(pharmacyResponse);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load reports"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const formatCurrency = (amount = 0) => {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  const cards = summary
    ? [
        {
          title: "Total Revenue",
          value: formatCurrency(summary.revenue),
          icon: IndianRupee,
        },
        {
          title: "Paid Revenue",
          value: formatCurrency(summary.paidRevenue),
          icon: FileText,
        },
        {
          title: "Appointments",
          value: summary.appointments,
          icon: CalendarDays,
        },
        {
          title: "Consultations",
          value: summary.consultations,
          icon: Stethoscope,
        },
        {
          title: "Medicines",
          value: summary.medicines,
          icon: Pill,
        },
        {
          title: "Low Stock",
          value: summary.lowStockMedicines,
          icon: AlertTriangle,
        },
        {
          title: "Purchases",
          value: summary.purchases,
          icon: ShoppingCart,
        },
        {
          title: "Pending Revenue",
          value: formatCurrency(summary.pendingRevenue),
          icon: FileText,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* =========================================
          HEADER
      ========================================= */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Clinic performance and business overview
          </p>
        </div>

        <button
          onClick={loadReports}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#123c35] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#0e302b] disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />

          Refresh
        </button>
      </div>

      {/* =========================================
          DATE FILTER
      ========================================= */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              From
            </label>

            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#123c35] focus:ring-1 focus:ring-[#123c35]"
            />
          </div>

          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              To
            </label>

            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#123c35] focus:ring-1 focus:ring-[#123c35]"
            />
          </div>

          <button
            onClick={loadReports}
            disabled={loading}
            className="rounded-lg bg-[#123c35] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#0e302b] disabled:opacity-50"
          >
            Apply Filter
          </button>
        </div>
      </div>

      {/* =========================================
          ERROR
      ========================================= */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =========================================
          SUMMARY CARDS
      ========================================= */}
      {loading && !summary ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500">
          Loading reports...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {card.title}
                    </p>

                    <h3 className="mt-2 text-2xl font-bold text-gray-900">
                      {card.value}
                    </h3>
                  </div>

                  <div className="rounded-lg bg-[#e8f3f0] p-3 text-[#123c35]">
                    <Icon size={21} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================
          APPOINTMENT + PHARMACY
      ========================================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Appointment */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Appointment Overview
          </h2>

          <div className="mt-5 space-y-3">
            {appointments.length === 0 ? (
              <p className="text-sm text-gray-500">
                No appointment data available.
              </p>
            ) : (
              appointments.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
                >
                  <span className="capitalize text-sm font-medium text-gray-700">
                    {item._id?.toLowerCase()}
                  </span>

                  <span className="font-semibold text-gray-900">
                    {item.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pharmacy */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Pharmacy Overview
          </h2>

          <div className="mt-5">
            <div className="mb-4 flex items-center justify-between rounded-lg bg-red-50 px-4 py-3">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle size={18} />

                <span className="text-sm font-medium">
                  Low Stock Medicines
                </span>
              </div>

              <span className="font-bold text-red-700">
                {pharmacy?.lowStock?.count || 0}
              </span>
            </div>

            <div className="space-y-2">
              {pharmacy?.lowStock?.medicines
                ?.slice(0, 5)
                .map((medicine) => (
                  <div
                    key={medicine._id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {medicine.medicineName}
                      </p>

                      <p className="text-xs text-gray-500">
                        {medicine.medicineCode}
                      </p>
                    </div>

                    <span className="text-sm font-semibold text-red-600">
                      {medicine.currentStock}
                    </span>
                  </div>
                ))}

              {!pharmacy?.lowStock?.medicines?.length && (
                <p className="py-4 text-center text-sm text-gray-500">
                  No low-stock medicines 🎉
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          REVENUE TABLE
      ========================================= */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Revenue Report
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Daily billing performance
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3">
                  Date
                </th>

                <th className="px-5 py-3">
                  Invoices
                </th>

                <th className="px-5 py-3">
                  Revenue
                </th>

                <th className="px-5 py-3">
                  Paid
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {revenue.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-5 py-8 text-center text-gray-500"
                  >
                    No revenue data available.
                  </td>
                </tr>
              ) : (
                revenue.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-5 py-3 font-medium text-gray-800">
                      {item._id}
                    </td>

                    <td className="px-5 py-3 text-gray-600">
                      {item.invoices}
                    </td>

                    <td className="px-5 py-3 font-medium text-gray-900">
                      {formatCurrency(item.revenue)}
                    </td>

                    <td className="px-5 py-3 font-medium text-green-600">
                      {formatCurrency(item.paid)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;