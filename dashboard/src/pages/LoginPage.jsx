import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../api/AuthContext.jsx";

const LoginPage = () => {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
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
          : { name: form.name, phone: form.phone, password: form.password, role: "caregiver" };

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
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] px-6">
      <div className="w-full max-w-sm">
        <p className="font-display text-2xl text-[#292521] mb-1">Medicine Reminder</p>
        <p className="text-sm text-[#8a8478] mb-8">Caregiver dashboard</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#e8e4dc] p-6 flex flex-col gap-4">
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
          {mode === "login" ? "New caregiver?" : "Already have an account?"}{" "}
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
  );
};

export default LoginPage;
