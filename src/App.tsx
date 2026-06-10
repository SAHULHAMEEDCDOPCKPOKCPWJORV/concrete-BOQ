import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AppContext';
import SignIn      from './pages/SignIn';
import MainLayout  from './components/MainLayout';
import Dashboard   from './pages/Dashboard';
import Estimator   from './pages/Estimator';
import BOQ         from './pages/BOQ';
import Reports     from './pages/Reports';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <SignIn />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index          element={<Dashboard />} />
        <Route path="estimator" element={<Estimator />} />
        <Route path="boq"       element={<BOQ />}     />
        <Route path="reports"   element={<Reports />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
