import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AuthPage } from './features/auth/AuthPage';
import { useAuthStore } from './app/store';
import { useAuth } from './features/auth/hooks/useAuth';
import { ApplicationsPage } from './features/applications/ApplicationsPage';
import { CvVersionsPage } from './features/cv/CvVersionsPage';
import { JobBoardPage } from './features/jobs/JobBoardPage';
import { useEffect } from 'react';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}

function AppShell() {
  const { me } = useAuth();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // me() runs on mount by react-query hook defaults
  }, []);

  if (me.isPending) {
    return <div>Loading NexaHire...</div>;
  }

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ApplicationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cv"
        element={
          <ProtectedRoute>
            <CvVersionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <JobBoardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
