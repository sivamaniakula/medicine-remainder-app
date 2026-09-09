import React from "react";
import { useAuth } from "../api/AuthContext.jsx";

const PatientHomePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] px-6">
      <div className="w-full max-w-sm text-center">
        <p className="font-display text-2xl text-[#292521] mb-1">Medicine Reminder</p>
        <p className="text-sm text-[#8a8478] mb-8">Patient account</p>

        <div className="bg-white rounded-2xl border border-[#e8e4dc] p-6">
          <p className="text-sm text-[#4a453d]">
            Hi <strong>{user?.name}</strong>, your account is set up.
          </p>
          <p className="text-sm text-[#8a8478] mt-3">
            Share this phone number with your caregiver so they can link your account:
          </p>
          <p className="text-lg font-medium text-accent-600 mt-2">{user?.phone}</p>
          <p className="text-xs text-[#8a8478] mt-4">
            A dedicated patient app (to view doses and receive reminders directly) is coming soon.
          </p>
        </div>

        <button onClick={logout} className="mt-4 text-sm text-[#8a8478] hover:underline">
          Log out
        </button>
      </div>
    </div>
  );
};

export default PatientHomePage;
