import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client.js";
import MedicationFormModal from "../components/MedicationFormModal.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const PatientPage = () => {
  const { patientId } = useParams();
  const [medications, setMedications] = useState([]);
  const [todayDoses, setTodayDoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);

  const fetchAll = async () => {
    try {
      const [medsRes, dosesRes] = await Promise.all([
        api.get(`/medications/patient/${patientId}`),
        api.get(`/doses/patient/${patientId}/today`),
      ]);
      setMedications(medsRes.data);
      setTodayDoses(dosesRes.data);
    } catch (err) {
      console.error("Failed to load patient data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const handleSaveMedication = async (data) => {
    if (editingMed) {
      await api.put(`/medications/${editingMed._id}`, data);
    } else {
      await api.post("/medications", { ...data, patientId });
    }
    setModalOpen(false);
    setEditingMed(null);
    fetchAll();
  };

  const handleDelete = async (medId) => {
    if (!confirm("Remove this medication? Its dose history will be kept.")) return;
    await api.delete(`/medications/${medId}`);
    fetchAll();
  };

  // Marks a dose as taken/missed/skipped by calling the backend, then
  // refreshes both the doses list and medications list (since marking a
  // dose "taken" decrements pillsRemaining on the backend).
  const handleMarkDose = async (doseId, status) => {
    try {
      await api.patch(`/doses/${doseId}`, { status, responseChannel: "app" });
      fetchAll();
    } catch (err) {
      console.error("Failed to update dose status", err);
      alert("Couldn't update the dose. Please try again.");
    }
  };

  const daysRemaining = (med) => {
    const daily = med.dailyDosageCount || med.times.length || 1;
    return Math.floor(med.pillsRemaining / daily);
  };

  return (
    <div>
      <Link to="/" className="text-sm text-accent-600 hover:underline mb-4 inline-block">
        ← All patients
      </Link>

      <div className="flex items-start justify-between mb-8">
        <h1 className="font-display text-2xl text-[#292521]">Medications</h1>
        <button
          onClick={() => {
            setEditingMed(null);
            setModalOpen(true);
          }}
          className="rounded-lg bg-accent-500 text-white text-sm font-medium px-4 py-2.5 hover:bg-accent-600 transition-colors"
        >
          + Add medication
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[#8a8478]">Loading...</p>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="text-sm font-medium text-[#8a8478] mb-3 uppercase tracking-wide">Today's doses</h2>
            {todayDoses.length === 0 ? (
              <p className="text-sm text-[#8a8478]">No doses scheduled for today yet.</p>
            ) : (
              <div className="bg-white border border-[#e8e4dc] rounded-2xl divide-y divide-[#f0ede6]">
                {todayDoses.map((dose) => (
                  <div key={dose._id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-[#292521]">{dose.medicationId?.name}</p>
                      <p className="text-xs text-[#8a8478]">
                        {new Date(dose.scheduledTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {dose.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleMarkDose(dose._id, "taken")}
                            className="text-xs font-medium text-accent-600 hover:underline"
                          >
                            Mark taken
                          </button>
                          <button
                            onClick={() => handleMarkDose(dose._id, "missed")}
                            className="text-xs font-medium text-[#8a8478] hover:text-status-missed hover:underline"
                          >
                            Mark missed
                          </button>
                        </>
                      )}
                      <StatusBadge status={dose.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-medium text-[#8a8478] mb-3 uppercase tracking-wide">All medications</h2>
            {medications.length === 0 ? (
              <div className="bg-white border border-dashed border-[#e0dcd2] rounded-2xl p-10 text-center">
                <p className="text-sm text-[#8a8478]">No medications added yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {medications.map((med) => {
                  const days = daysRemaining(med);
                  const low = days <= (med.refillThreshold || 3);
                  return (
                    <div key={med._id} className="bg-white border border-[#e8e4dc] rounded-2xl p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-[#292521]">{med.name}</p>
                          <p className="text-sm text-[#8a8478]">
                            {med.dosage} · {med.frequency}
                          </p>
                        </div>
                        {low && (
                          <span className="text-xs font-medium text-status-missed bg-[#fbeae7] rounded-full px-2 py-0.5">
                            Low refill
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8a8478] mt-3">Times: {med.times.join(", ")}</p>
                      <p className="text-xs text-[#8a8478]">
                        {med.pillsRemaining} pills left (~{days} day{days === 1 ? "" : "s"})
                      </p>
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => {
                            setEditingMed(med);
                            setModalOpen(true);
                          }}
                          className="text-sm text-accent-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(med._id)}
                          className="text-sm text-[#8a8478] hover:text-status-missed"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {modalOpen && (
        <MedicationFormModal
          initial={editingMed}
          onClose={() => {
            setModalOpen(false);
            setEditingMed(null);
          }}
          onSave={handleSaveMedication}
        />
      )}
    </div>
  );
};

export default PatientPage;
