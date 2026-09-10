import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, BellRing, Smartphone, ArrowRight } from "lucide-react";
import api from "../api/client.js";
import StatCard from "../components/StatCard.jsx";

const CHANNEL_LABEL = { app: "App (push)", whatsapp: "WhatsApp", voice: "Voice call" };

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const DashboardPage = () => {
  const [patients, setPatients] = useState([]);
  const [alertCount, setAlertCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phoneInput, setPhoneInput] = useState("");
  const [linkError, setLinkError] = useState("");
  const [linking, setLinking] = useState(false);
  // Tracks which patient's settings are currently being saved, so we can
  // show a small "Saving..." state on just that card's dropdowns.
  const [savingPatientId, setSavingPatientId] = useState(null);

  const fetchPatients = async () => {
    try {
      const res = await api.get("/links/patients");
      setPatients(res.data);
    } catch (err) {
      console.error("Failed to load patients", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertCount = async () => {
    try {
      const res = await api.get("/alerts?resolved=false");
      setAlertCount(res.data.length);
    } catch (err) {
      console.error("Failed to load alerts", err);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchAlertCount();
  }, []);

  const handleLink = async (e) => {
    e.preventDefault();
    setLinkError("");
    setLinking(true);
    try {
      await api.post("/links", { patientPhone: phoneInput });
      setPhoneInput("");
      fetchPatients();
    } catch (err) {
      setLinkError(err.response?.data?.message || "Could not link that patient.");
    } finally {
      setLinking(false);
    }
  };

  // Updates a patient's preferredChannel or preferredLanguage.
  // Called from the dropdowns below - `field` is either "preferredChannel"
  // or "preferredLanguage" so one handler covers both dropdowns.
  const handleSettingChange = async (patientId, field, value) => {
    setSavingPatientId(patientId);
    try {
      await api.patch(`/links/patient/${patientId}/settings`, { [field]: value });
      // Update local state immediately instead of refetching everything,
      // so the dropdown doesn't visually "jump" while saving.
      setPatients((prev) =>
        prev.map((p) => (p._id === patientId ? { ...p, [field]: value } : p))
      );
    } catch (err) {
      console.error("Failed to update patient setting", err);
      alert("Couldn't update that setting. Please try again.");
    } finally {
      setSavingPatientId(null);
    }
  };

  const remoteChannelCount = patients.filter((p) => p.preferredChannel !== "app").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-[#292521]">Your patients</h1>
        <p className="text-sm text-[#8a8478] mt-1">Manage medications and track adherence for each patient.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Patients linked" value={patients.length} icon={Users} tone="accent" />
        <StatCard
          label="Unresolved alerts"
          value={alertCount ?? "–"}
          sublabel={alertCount ? "Needs a look" : "All clear"}
          icon={BellRing}
          tone={alertCount ? "red" : "neutral"}
        />
        <StatCard
          label="On WhatsApp / voice"
          value={remoteChannelCount}
          sublabel="of your linked patients"
          icon={Smartphone}
          tone="amber"
        />
      </div>

      <form onSubmit={handleLink} className="bg-white border border-[#e8e4dc] rounded-2xl p-5 mb-8 flex items-end gap-3 shadow-card">
        <div className="flex-1">
          <label className="text-sm text-[#4a453d] mb-1 block">Link a patient by phone number</label>
          <input
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            required
            placeholder="9876500000"
            className="w-full rounded-lg border border-[#e0dcd2] px-3 py-2 text-sm focus:border-accent-400"
          />
          <p className="text-xs text-[#8a8478] mt-1">The patient must already have an account registered with this phone number.</p>
        </div>
        <button
          type="submit"
          disabled={linking}
          className="rounded-lg bg-accent-500 text-white text-sm font-medium px-4 py-2.5 hover:bg-accent-600 transition-colors disabled:opacity-60"
        >
          {linking ? "Linking..." : "Link patient"}
        </button>
      </form>
      {linkError && <p className="text-sm text-status-missed -mt-6 mb-6">{linkError}</p>}

      {loading ? (
        <p className="text-sm text-[#8a8478]">Loading patients...</p>
      ) : patients.length === 0 ? (
        <div className="bg-white border border-dashed border-[#e0dcd2] rounded-2xl p-10 text-center">
          <p className="text-sm text-[#8a8478]">No patients linked yet. Link one using their phone number above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {patients.map((patient) => (
            <div
              key={patient._id}
              className="group bg-white border border-[#e8e4dc] rounded-2xl p-5 hover:border-accent-400 hover:shadow-card transition-all"
            >
              <Link to={`/patients/${patient._id}`} className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-full bg-accent-50 text-accent-600 font-display text-base flex items-center justify-center shrink-0">
                  {initials(patient.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#292521] truncate">{patient.name}</p>
                  <p className="text-sm text-[#8a8478] mt-0.5">{patient.phone}</p>
                </div>
                <ArrowRight
                  size={16}
                  className="text-[#c9c3b6] group-hover:text-accent-500 group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </Link>

              {/* Channel + language pickers - these call the new
                  PATCH /api/links/patient/:id/settings endpoint (Bundle B).
                  stopPropagation prevents clicks here from triggering the
                  parent Link's navigation. */}
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <select
                  value={patient.preferredLanguage}
                  disabled={savingPatientId === patient._id}
                  onChange={(e) => handleSettingChange(patient._id, "preferredLanguage", e.target.value)}
                  className="text-xs rounded-full bg-accent-50 text-accent-600 px-2 py-1 border-none focus:ring-1 focus:ring-accent-400"
                >
                  <option value="en">English</option>
                  <option value="te">Telugu</option>
                </select>
                <select
                  value={patient.preferredChannel}
                  disabled={savingPatientId === patient._id}
                  onChange={(e) => handleSettingChange(patient._id, "preferredChannel", e.target.value)}
                  className="text-xs rounded-full bg-[#f2efe8] text-[#8a8478] px-2 py-1 border-none focus:ring-1 focus:ring-accent-400"
                >
                  {Object.entries(CHANNEL_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
