import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pill, Bell, Phone } from "lucide-react";
import api from "../api/client.js";
import { useAuth } from "../api/AuthContext.jsx";

const LoginPage = () => {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", phone: "", password: "", role: "caregiver" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const body =
        mode === "login"
          ? { phone: form.phone, password: form.password }
          : { name: form.name, phone: form.phone, password: form.password, role: form.role };

      const res = await api.post(endpoint, body);
      login(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#faf9f6]">
      <div className="hidden lg:flex w-[42%] bg-ink-900 px-12 py-14 flex-col justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-accent-500 flex items-center justify-center shrink-0">
            <Pill size={18} className="text-white" strokeWidth={2.25} />
          </div>
          <p className="font-display text-lg text-white">Medicine Reminder</p>
        </div>

        <div>
          <p className="font-display text-3xl text-white leading-snug max-w-sm">
            One dashboard to keep every dose on track.
          </p>
          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-white/70 text-sm">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Bell size={14} className="text-white" strokeWidth={2} />
              </div>
              Real-time alerts for missed doses and low refills
            </div>
            <div className="flex items-center gap-3 text-white/70 text-sm">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Phone size={14} className="text-white" strokeWidth={2} />
              </div>
              Reminders by app, WhatsApp, or voice call
            </div>
          </div>
        </div>

        <p className="text-xs text-white/35">For caregivers managing medication schedules.</p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <p className="font-display text-2xl text-[#292521] mb-1">Medicine Reminder</p>
            <p className="text-sm text-[#8a8478]">Caregiver dashboard</p>
          </div>
          <p className="hidden lg:block font-display text-2xl text-[#292521] mb-1">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </p>
          <p className="hidden lg:block text-sm text-[#8a8478] mb-8">
            {mode === "login" ? "Log in to your account." : "Set up your account."}
          </p>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#e8e4dc] p-6 flex flex-col gap-4 shadow-card">
            {mode === "register" && (
              <div>
                <label className="text-sm text-[#4a453d] mb-1 block">I am a</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "caregiver", label: "Caregiver" },
                    { value: "patient", label: "Patient" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm({ ...form, role: option.value })}
                      className={`rounded-lg border text-sm py-2 transition-colors ${
                        form.role === option.value
                          ? "border-accent-500 bg-accent-50 text-accent-600 font-medium"
                          : "border-[#e0dcd2] text-[#4a453d] hover:border-accent-400"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[#8a8478] mt-1">
                  {form.role === "caregiver"
                    ? "You'll manage medications and reminders for linked patients."
                    : "You'll receive dose reminders. A caregiver can link to this account by your phone number."}
                </p>
              </div>
            )}

            {mode === "register" && (
              <div>
                <label className="text-sm text-[#4a453d] mb-1 block">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-[#e0dcd2] px-3 py-2 text-sm focus:border-accent-400"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="text-sm text-[#4a453d] mb-1 block">Phone number</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-[#e0dcd2] px-3 py-2 text-sm focus:border-accent-400"
                placeholder="9876543210"
              />
            </div>

            <div>
              <label className="text-sm text-[#4a453d] mb-1 block">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-[#e0dcd2] px-3 py-2 text-sm focus:border-accent-400"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-status-missed">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-lg bg-accent-500 text-white text-sm font-medium py-2.5 hover:bg-accent-600 transition-colors disabled:opacity-60"
            >
              {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>

          <p className="text-sm text-[#8a8478] mt-4 text-center">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
              className="text-accent-600 hover:underline"
            >
              {mode === "login" ? "Create an account" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
