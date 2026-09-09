import React from "react";

// Renders a small colored dot + label matching the project's color-coded
// status system: green (taken), amber (upcoming/pending), red (missed).
const STATUS_STYLES = {
  taken: { color: "#1f8a77", bg: "#eefaf7", label: "Taken" },
  pending: { color: "#c98a1c", bg: "#fdf4e6", label: "Upcoming" },
  missed: { color: "#c0432f", bg: "#fbeae7", label: "Missed" },
  skipped: { color: "#8a8478", bg: "#f2efe8", label: "Skipped" },
};

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1"
      style={{ color: style.color, backgroundColor: style.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.color }} />
      {style.label}
    </span>
  );
};

export default StatusBadge;
