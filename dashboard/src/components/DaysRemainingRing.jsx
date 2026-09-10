import React from "react";

// Small SVG progress ring showing days-of-supply remaining against the
// refill threshold, so a caregiver can see "running low" at a glance
// without reading the numbers.
const DaysRemainingRing = ({ days, threshold, low }) => {
  const size = 44;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  // Treat 4x the threshold as "full" so the ring fills up sensibly for
  // typical refill windows without needing a total pack size.
  const target = Math.max(threshold * 4, 1);
  const pct = Math.max(0, Math.min(1, days / target));
  const color = low ? "#c0432f" : "#1f8a77";

  return (
    <div className="relative w-11 h-11 shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f0ede6" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium" style={{ color }}>
        {days}d
      </span>
    </div>
  );
};

export default DaysRemainingRing;
