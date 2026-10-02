import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import LiveSimulatorModal from './components/LiveSimulatorModal';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import MessageRecipientPage from './pages/MessageRecipientPage';
import NetworkDemoPage from './pages/NetworkDemoPage';

function AppLayout({ children, onOpenSimulator }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-white transition-colors duration-200">
      <Navbar onOpenSimulator={onOpenSimulator} />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function MainRoutes({ onOpenSimulator }) {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
      />

      {/* Admin Authentication */}
      <Route
        path="/login"
        element={
          <AppLayout onOpenSimulator={onOpenSimulator}>
            <LoginPage />
          </AppLayout>
        }
      />

      {/* Protected Admin Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout onOpenSimulator={onOpenSimulator}>
              <DashboardPage onOpenSimulator={onOpenSimulator} />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected Delivery History */}
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <AppLayout onOpenSimulator={onOpenSimulator}>
              <HistoryPage onOpenSimulator={onOpenSimulator} />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Networking Visualizer Demo */}
      <Route
        path="/network-demo"
        element={
          <AppLayout onOpenSimulator={onOpenSimulator}>
            <NetworkDemoPage />
          </AppLayout>
        }
      />

      {/* Public Recipient View (Standalone full page for recipients) */}
      <Route
        path="/message/:token"
        element={<MessageRecipientPage />}
      />

      {/* 404 Catch-All */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default function App() {
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <MainRoutes onOpenSimulator={() => setIsSimulatorOpen(true)} />
          <LiveSimulatorModal
            isOpen={isSimulatorOpen}
            onClose={() => setIsSimulatorOpen(false)}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
