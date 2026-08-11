import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await login(
        form.email,
        form.password
      );

      navigate("/");

    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to login. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8f6] flex">

      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-[#123c35]">

        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="absolute -bottom-40 -right-20 h-125 w-125 rounded-full bg-teal-300/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">

          {/* Logo */}
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 border border-white/10">
              <Leaf
                size={23}
                className="text-emerald-300"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-wide text-white">
                AyurSutra
              </h1>

              <p className="text-xs text-emerald-100/60">
                Clinic Management System
              </p>
            </div>

          </div>

          {/* Main Message */}
          <div className="max-w-xl">

            <span className="inline-flex items-center rounded-full border border-emerald-300/20 bg-white/5 px-4 py-2 text-xs font-medium text-emerald-200">
              Smart Healthcare • Ayurvedic Care
            </span>

            <h2 className="mt-7 text-4xl font-bold leading-tight text-white xl:text-5xl">
              Simplify your clinic.
              <br />
              <span className="text-emerald-300">
                Focus on healing.
              </span>
            </h2>

            <p className="mt-6 max-w-lg text-base leading-7 text-emerald-50/65">
              Manage patients, appointments, consultations,
              prescriptions, pharmacy, inventory, billing and
              reports — all from one powerful platform.
            </p>

            <div className="mt-10 grid grid-cols-3 gap-4">

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-bold text-white">
                  01
                </p>
                <p className="mt-1 text-xs text-emerald-100/60">
                  Patient Care
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-bold text-white">
                  02
                </p>
                <p className="mt-1 text-xs text-emerald-100/60">
                  Smart Pharmacy
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-bold text-white">
                  03
                </p>
                <p className="mt-1 text-xs text-emerald-100/60">
                  Clinic Insights
                </p>
              </div>

            </div>

          </div>

          <p className="text-xs text-emerald-100/40">
            © 2026 AyurSutra. Built for modern Ayurvedic healthcare.
          </p>

        </div>
      </div>

      {/* Login Section */}
      <div className="flex w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-[48%]">

        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#123c35]">
              <Leaf
                size={22}
                className="text-emerald-300"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold text-[#123c35]">
                AyurSutra
              </h1>

              <p className="text-xs text-gray-500">
                Clinic Management System
              </p>
            </div>

          </div>

          <div className="rounded-3xl border border-gray-200/80 bg-white p-7 shadow-[0_20px_60px_rgba(18,60,53,0.08)] sm:p-9">

            <div className="mb-8">

              <p className="text-sm font-semibold text-emerald-700">
                Welcome back
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                Sign in to AyurSutra
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Access your clinic management dashboard.
              </p>

            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Email */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email address
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="admin@ayursutra.com"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                  />

                </div>

              </div>

              {/* Password */}
              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>

                <div className="relative">

                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-[#123c35] px-5 text-sm font-semibold text-white shadow-lg shadow-[#123c35]/15 transition hover:bg-[#0d302a] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Signing in..."
                  : "Sign in"}
              </button>

            </form>

            <div className="mt-7 flex items-center gap-3">

              <div className="h-px flex-1 bg-gray-100" />

              <span className="text-xs text-gray-400">
                Secure clinic access
              </span>

              <div className="h-px flex-1 bg-gray-100" />

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;