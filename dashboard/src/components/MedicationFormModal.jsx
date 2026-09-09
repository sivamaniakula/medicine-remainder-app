import React, { useState } from "react";

const emptyForm = {
  name: "",
  dosage: "",
  frequency: "",
  times: "",
  startDate: "",
  pillsRemaining: "",
  refillThreshold: "3",
};

// A bottom-sheet-style modal for adding or editing a medication.
// Times are entered as a comma-separated list (e.g. "09:00, 21:00")
// and split into an array on submit.
const MedicationFormModal = ({ initial, onClose, onSave }) => {
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name,
          dosage: initial.dosage,
          frequency: initial.frequency,
          times: initial.times.join(", "),
          startDate: initial.startDate?.slice(0, 10) || "",
          pillsRemaining: String(initial.pillsRemaining),
          refillThreshold: String(initial.refillThreshold ?? 3),
        }
      : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const times = form.times
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await onSave({
        name: form.name,
        dosage: form.dosage,
        frequency: form.frequency,
        times,
        startDate: form.startDate,
        pillsRemaining: Number(form.pillsRemaining),
        refillThreshold: Number(form.refillThreshold),
      });
    } catch (err) {
      setError(err.response?.data?.message || "Could not save this medication.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="font-display text-xl text-[#292521] mb-4">{initial ? "Edit medication" : "Add medication"}</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-sm text-[#4a453d] mb-1 block">Medicine name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-[#e0dcd2] px-3 py-2 text-sm focus:border-accent-400"
              placeholder="Paracetamol"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-[#4a453d] mb-1 block">Dosage</label>
              <input
                name="dosage"
                value={form.dosage}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-[#e0dcd2] px-3 py-2 text-sm focus:border-accent-400"
                placeholder="500mg"
              />
            </div>
            <div>
              <label className="text-sm text-[#4a453d] mb-1 block">Frequency</label>
              <input
                name="frequency"
                value={form.frequency}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-[#e0dcd2] px-3 py-2 text-sm focus:border-accent-400"
                placeholder="Twice daily"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-[#4a453d] mb-1 block">Scheduled times (24hr, comma-separated)</label>
            <input
              name="times"
              value={form.times}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-[#e0dcd2] px-3 py-2 text-sm focus:border-accent-400"
              placeholder="09:00, 21:00"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-[#4a453d] mb-1 block">Start date</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-[#e0dcd2] px-3 py-2 text-sm focus:border-accent-400"
              />
            </div>
            <div>
              <label className="text-sm text-[#4a453d] mb-1 block">Pills remaining</label>
              <input
                type="number"
                min="0"
                name="pillsRemaining"
                value={form.pillsRemaining}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-[#e0dcd2] px-3 py-2 text-sm focus:border-accent-400"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-[#4a453d] mb-1 block">Alert when days remaining drops to</label>
            <input
              type="number"
              min="1"
              name="refillThreshold"
              value={form.refillThreshold}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#e0dcd2] px-3 py-2 text-sm focus:border-accent-400"
            />
          </div>

          {error && <p className="text-sm text-status-missed">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#e0dcd2] text-sm font-medium py-2.5 text-[#4a453d] hover:bg-[#f7f5f0] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-accent-500 text-white text-sm font-medium py-2.5 hover:bg-accent-600 transition-colors disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save medication"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicationFormModal;
