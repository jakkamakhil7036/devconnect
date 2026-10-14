import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Common/Navbar';
import Sidebar from './components/Common/Sidebar';

// Pages
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetails from './pages/ProjectDetails';
import AIRecommendations from './pages/AIRecommendations';
import ShowcasePortal from './pages/ShowcasePortal';
import ResumeBuilder from './pages/ResumeBuilder';
import AdminDashboard from './pages/AdminDashboard';

// Spinner Component for loading states
const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-darkbg">
    <div className="relative flex h-16 w-16 items-center justify-center">
      <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      <div className="absolute h-12 w-12 animate-ping rounded-full bg-primary/20"></div>
    </div>
  </div>
);

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

// Admin Route wrapper
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  return isAuthenticated && user?.role === 'admin' ? children : <Navigate to="/" replace />;
};

// Main Layout Wrapper
const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-slate-800 dark:bg-darkbg dark:text-slate-100">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  const { isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <MainLayout>
              <ProfilePage />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/projects" element={
          <ProtectedRoute>
            <MainLayout>
              <ProjectsPage />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/projects/:id" element={
          <ProtectedRoute>
            <MainLayout>
              <ProjectDetails />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/recommendations" element={
          <ProtectedRoute>
            <MainLayout>
              <AIRecommendations />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/showcase" element={
          <ProtectedRoute>
            <MainLayout>
              <ShowcasePortal />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/resume" element={
          <ProtectedRoute>
            <MainLayout>
              <ResumeBuilder />
            </MainLayout>
          </ProtectedRoute>
        } />

        {/* Admin Route */}
        <Route path="/admin" element={
          <AdminRoute>
            <MainLayout>
              <AdminDashboard />
            </MainLayout>
          </AdminRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
