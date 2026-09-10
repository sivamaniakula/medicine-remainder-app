import React from "react";
import { Check, Clock, X, Minus } from "lucide-react";

// Renders a small icon + label matching the project's color-coded
// status system: green (taken), amber (upcoming/pending), red (missed).
const STATUS_STYLES = {
  taken: { color: "#1f8a77", bg: "#eefaf7", label: "Taken", Icon: Check },
  pending: { color: "#c98a1c", bg: "#fdf4e6", label: "Upcoming", Icon: Clock },
  missed: { color: "#c0432f", bg: "#fbeae7", label: "Missed", Icon: X },
  skipped: { color: "#8a8478", bg: "#f2efe8", label: "Skipped", Icon: Minus },
};

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const { Icon } = style;
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium rounded-full pl-1.5 pr-2.5 py-1"
      style={{ color: style.color, backgroundColor: style.bg }}
    >
      <Icon size={12} strokeWidth={2.5} />
      {style.label}
    </span>
  );
};

export default StatusBadge;
