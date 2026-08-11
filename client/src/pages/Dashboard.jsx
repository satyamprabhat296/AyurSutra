import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Loader2,
  Users,
  XCircle,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] =
    useState(false);
  const [error, setError] = useState("");

  const isPharmacyRole =
    user?.role === "super_admin" ||
    user?.role === "pharmacist";

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          patientsResponse,
          appointmentsResponse,
          billsResponse,
        ] = await Promise.all([
          api.get("/patient"),
          api.get("/appointment"),
          api.get("/billing"),
        ]);

        setPatients(
          patientsResponse.data?.patients || []
        );

        setAppointments(
          appointmentsResponse.data?.appointments || []
        );

        setBills(
          billsResponse.data?.bills || []
        );

        if (isPharmacyRole) {
          try {
            setInventoryLoading(true);

            const inventoryResponse =
              await api.get("/inventory");

            setInventory(
              inventoryResponse.data?.inventory || []
            );
          } catch {
            setInventory([]);
          } finally {
            setInventoryLoading(false);
          }
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [isPharmacyRole]);

  const today = useMemo(() => {
    const date = new Date();

    return date.toISOString().split("T")[0];
  }, []);

  const todaysAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      if (!appointment.appointmentDate) {
        return false;
      }

      const date = new Date(
        appointment.appointmentDate
      )
        .toISOString()
        .split("T")[0];

      return date === today;
    });
  }, [appointments, today]);

  const todaysRevenue = useMemo(() => {
    return bills
      .filter((bill) => {
        if (!bill.createdAt) {
          return false;
        }

        const date = new Date(bill.createdAt)
          .toISOString()
          .split("T")[0];

        return (
          date === today &&
          bill.paymentStatus === "PAID"
        );
      })
      .reduce(
        (total, bill) =>
          total + Number(bill.total || 0),
        0
      );
  }, [bills, today]);

  const appointmentStats = useMemo(() => {
    return {
      booked: todaysAppointments.filter(
        (item) => item.status === "BOOKED"
      ).length,

      checkedIn: todaysAppointments.filter(
        (item) => item.status === "CHECKED_IN"
      ).length,

      completed: todaysAppointments.filter(
        (item) => item.status === "COMPLETED"
      ).length,

      cancelled: todaysAppointments.filter(
        (item) => item.status === "CANCELLED"
      ).length,
    };
  }, [todaysAppointments]);

  const lowStockMedicines = useMemo(() => {
    if (!Array.isArray(inventory)) {
      return [];
    }

    /*
      Inventory history does not necessarily contain
      current medicine stock.

      Therefore we only display inventory records here
      and leave low-stock calculation for the Medicine
      module where currentStock/minimumStock are available.
    */

    return inventory.slice(0, 5);
  }, [inventory]);

  const recentAppointments = useMemo(() => {
    return [...appointments]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )
      .slice(0, 6);
  }, [appointments]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const statusStyles = {
    BOOKED:
      "bg-blue-50 text-blue-700",
    CHECKED_IN:
      "bg-amber-50 text-amber-700",
    IN_CONSULTATION:
      "bg-purple-50 text-purple-700",
    COMPLETED:
      "bg-emerald-50 text-emerald-700",
    CANCELLED:
      "bg-red-50 text-red-700",
    NO_SHOW:
      "bg-gray-100 text-gray-600",
  };

  const stats = [
    {
      title: "Total Patients",
      value: patients.length,
      subtitle: "Registered patients",
      icon: Users,
    },
    {
      title: "Today's Appointments",
      value: todaysAppointments.length,
      subtitle: "Scheduled today",
      icon: CalendarDays,
    },
    {
      title: "Today's Revenue",
      value: formatCurrency(todaysRevenue),
      subtitle: "Paid invoices",
      icon: IndianRupee,
    },
    {
      title: "Inventory Records",
      value: isPharmacyRole
        ? inventory.length
        : "—",
      subtitle: isPharmacyRole
        ? "Inventory transactions"
        : "Pharmacy access only",
      icon: Activity,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">

          <Loader2
            size={30}
            className="animate-spin text-emerald-700"
          />

          <p className="text-sm text-gray-500">
            Loading your dashboard...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

        <div>

          <p className="text-sm font-semibold text-emerald-700">
            AyurSutra Dashboard
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
            Good to see you
            {user?.name
              ? `, ${user.name.split(" ")[0]}`
              : ""}
            .
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Here's what's happening at your clinic today.
          </p>

        </div>

        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 shadow-sm">

          <CalendarDays
            size={16}
            className="text-emerald-700"
          />

          {new Date().toLocaleDateString(
            "en-IN",
            {
              weekday: "long",
              day: "numeric",
              month: "long",
            }
          )}

        </div>

      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">

          <AlertTriangle size={18} />

          <span>{error}</span>

        </div>
      )}

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="group rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>

                  <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {stat.subtitle}
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-[#123c35] group-hover:text-emerald-200">

                  <Icon size={21} />

                </div>

              </div>

            </div>
          );
        })}

      </div>

      {/* Middle section */}
      <div className="grid gap-6 xl:grid-cols-3">

        {/* Appointment Overview */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm xl:col-span-1">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="font-bold text-gray-900">
                Today's Overview
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Appointment status
              </p>

            </div>

            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
              <Activity size={18} />
            </div>

          </div>

          <div className="mt-6 space-y-4">

            <StatusRow
              icon={Clock3}
              label="Booked"
              value={appointmentStats.booked}
              iconClass="text-blue-600 bg-blue-50"
            />

            <StatusRow
              icon={Users}
              label="Checked In"
              value={appointmentStats.checkedIn}
              iconClass="text-amber-600 bg-amber-50"
            />

            <StatusRow
              icon={CheckCircle2}
              label="Completed"
              value={appointmentStats.completed}
              iconClass="text-emerald-600 bg-emerald-50"
            />

            <StatusRow
              icon={XCircle}
              label="Cancelled"
              value={appointmentStats.cancelled}
              iconClass="text-red-600 bg-red-50"
            />

          </div>

        </div>

        {/* Recent Appointments */}
        <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm xl:col-span-2">

          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

            <div>

              <h2 className="font-bold text-gray-900">
                Recent Appointments
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Latest appointments in your clinic
              </p>

            </div>

            <a
              href="/appointments"
              className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
            >
              View all
              <ArrowUpRight size={14} />
            </a>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400">

                  <th className="px-6 py-3 font-medium">
                    Appointment
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Patient
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Date
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody>

                {recentAppointments.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-12 text-center text-sm text-gray-400"
                    >
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  recentAppointments.map(
                    (appointment) => (
                      <tr
                        key={appointment._id}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/70"
                      >

                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                          {appointment.appointmentNumber ||
                            "—"}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {appointment.patient?.fullName ||
                            appointment.patient?.name ||
                            "Patient"}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(
                            appointment.appointmentDate
                          )}
                        </td>

                        <td className="px-6 py-4">

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              statusStyles[
                                appointment.status
                              ] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {appointment.status ||
                              "UNKNOWN"}
                          </span>

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

      {/* Pharmacy */}
      {isPharmacyRole && (
        <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

            <div>

              <h2 className="font-bold text-gray-900">
                Recent Inventory Activity
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                Latest pharmacy stock transactions
              </p>

            </div>

            {inventoryLoading && (
              <Loader2
                size={17}
                className="animate-spin text-emerald-700"
              />
            )}

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400">

                  <th className="px-6 py-3 font-medium">
                    Medicine
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Transaction
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Quantity
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Date
                  </th>

                </tr>
              </thead>

              <tbody>

                {lowStockMedicines.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-12 text-center text-sm text-gray-400"
                    >
                      No inventory activity found.
                    </td>
                  </tr>
                ) : (
                  lowStockMedicines.map(
                    (item, index) => (
                      <tr
                        key={
                          item._id || index
                        }
                        className="border-b border-gray-50 last:border-0"
                      >

                        <td className="px-6 py-4 text-sm font-medium text-gray-700">
                          {item.medicine?.medicineName ||
                            "Medicine"}
                        </td>

                        <td className="px-6 py-4">

                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                            {item.transactionType ||
                              "—"}
                          </span>

                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {item.quantity || 0}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(
                            item.createdAt
                          )}
                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>

        </div>
      )}

    </div>
  );
};

const StatusRow = ({
  icon: Icon,
  label,
  value,
  iconClass,
}) => {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}
        >
          <Icon size={16} />
        </div>

        <span className="text-sm font-medium text-gray-600">
          {label}
        </span>

      </div>

      <span className="text-sm font-bold text-gray-900">
        {value}
      </span>

    </div>
  );
};

export default Dashboard;