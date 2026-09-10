import React from "react";

// A compact KPI card used across the dashboard and patient pages.
// `tone` picks a pre-set icon color so callers don't hand-roll hex values.
const TONES = {
  accent: { icon: "text-accent-600", chip: "bg-accent-50" },
  amber: { icon: "text-status-upcoming", chip: "bg-[#fdf4e6]" },
  red: { icon: "text-status-missed", chip: "bg-[#fbeae7]" },
  neutral: { icon: "text-[#4a453d]", chip: "bg-[#f0ede6]" },
};

const StatCard = ({ label, value, sublabel, icon: Icon, tone = "accent" }) => {
  const t = TONES[tone] || TONES.accent;
  return (
    <div className="bg-white border border-[#e8e4dc] rounded-2xl p-5 shadow-card flex items-start justify-between">
      <div>
        <p className="text-sm text-[#8a8478]">{label}</p>
        <p className="font-display text-3xl text-[#292521] mt-1.5">{value}</p>
        {sublabel && <p className="text-xs text-[#8a8478] mt-1">{sublabel}</p>}
      </div>
      {Icon && (
        <div className={`w-10 h-10 rounded-xl ${t.chip} flex items-center justify-center shrink-0`}>
          <Icon size={18} className={t.icon} strokeWidth={2} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
