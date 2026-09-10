import React, { useEffect, useState } from "react";
import { PillBottle, PackageX, PhoneIncoming, Check } from "lucide-react";
import api from "../api/client.js";

const TYPE_META = {
  "missed-dose": { label: "Missed dose", icon: PillBottle, color: "#c0432f", bg: "#fbeae7" },
  refill: { label: "Low refill", icon: PackageX, color: "#c98a1c", bg: "#fdf4e6" },
  "callback-request": { label: "Callback requested", icon: PhoneIncoming, color: "#1f8a77", bg: "#eefaf7" },
};

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("unresolved");

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const query = filter === "unresolved" ? "?resolved=false" : "";
      const res = await api.get(`/alerts${query}`);
      setAlerts(res.data);
    } catch (err) {
      console.error("Failed to load alerts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleResolve = async (id) => {
    await api.patch(`/alerts/${id}/resolve`);
    fetchAlerts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-[#292521]">Alerts</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("unresolved")}
            className={`text-sm rounded-full px-3 py-1.5 transition-colors ${
              filter === "unresolved" ? "bg-accent-500 text-white" : "bg-white border border-[#e0dcd2] text-[#4a453d]"
            }`}
          >
            Unresolved
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`text-sm rounded-full px-3 py-1.5 transition-colors ${
              filter === "all" ? "bg-accent-500 text-white" : "bg-white border border-[#e0dcd2] text-[#4a453d]"
            }`}
          >
            All
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-[#8a8478]">Loading...</p>
      ) : alerts.length === 0 ? (
        <div className="bg-white border border-dashed border-[#e0dcd2] rounded-2xl p-10 text-center">
          <p className="text-sm text-[#8a8478]">No alerts here. You'll see missed doses and low refills as they happen.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {alerts.map((alert) => {
            const meta = TYPE_META[alert.type] || TYPE_META["missed-dose"];
            const Icon = meta.icon;
            return (
              <div
                key={alert._id}
                className="bg-white border border-[#e8e4dc] rounded-2xl p-4 flex items-start gap-3.5 shadow-card"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: meta.bg }}
                >
                  <Icon size={16} style={{ color: meta.color }} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <span
                    className="inline-block text-xs font-medium rounded-full px-2 py-0.5 mb-1.5"
                    style={{ color: meta.color, backgroundColor: meta.bg }}
                  >
                    {meta.label}
                  </span>
                  <p className="text-sm text-[#292521]">{alert.message}</p>
                  <p className="text-xs text-[#8a8478] mt-1">
                    {alert.patientId?.name} · {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </div>
                {!alert.resolved && (
                  <button
                    onClick={() => handleResolve(alert._id)}
                    className="inline-flex items-center gap-1.5 text-sm text-accent-600 hover:underline shrink-0 mt-0.5"
                  >
                    <Check size={14} /> Resolve
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
