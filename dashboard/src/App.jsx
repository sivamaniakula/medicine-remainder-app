import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./api/AuthContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import PatientPage from "./pages/PatientPage.jsx";
import PatientHomePage from "./pages/PatientHomePage.jsx";
import AlertsPage from "./pages/AlertsPage.jsx";
import Layout from "./components/Layout.jsx";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const CaregiverRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "caregiver") return <Navigate to="/patient-home" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/patient-home"
        element={
          <ProtectedRoute>
            <PatientHomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <CaregiverRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </CaregiverRoute>
        }
      />
      <Route
        path="/patients/:patientId"
        element={
          <CaregiverRoute>
            <Layout>
              <PatientPage />
            </Layout>
          </CaregiverRoute>
        }
      />
      <Route
        path="/alerts"
        element={
          <CaregiverRoute>
            <Layout>
              <AlertsPage />
            </Layout>
          </CaregiverRoute>
        }
      />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;
