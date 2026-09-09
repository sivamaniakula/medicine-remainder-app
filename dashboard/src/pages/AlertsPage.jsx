import React, { useEffect, useState } from "react";
import api from "../api/client.js";

const TYPE_LABELS = {
  "missed-dose": "Missed dose",
  refill: "Low refill",
  "callback-request": "Callback requested",
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
        <div className="bg-white border border-[#e8e4dc] rounded-2xl divide-y divide-[#f0ede6]">
          {alerts.map((alert) => (
            <div key={alert._id} className="flex items-center justify-between px-5 py-4">
              <div>
                <span className="text-xs font-medium text-status-missed bg-[#fbeae7] rounded-full px-2 py-0.5 mr-2">
                  {TYPE_LABELS[alert.type] || alert.type}
                </span>
                <p className="text-sm text-[#292521] mt-1.5">{alert.message}</p>
                <p className="text-xs text-[#8a8478] mt-0.5">
                  {alert.patientId?.name} · {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>
              {!alert.resolved && (
                <button
                  onClick={() => handleResolve(alert._id)}
                  className="text-sm text-accent-600 hover:underline shrink-0 ml-4"
                >
                  Mark resolved
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
