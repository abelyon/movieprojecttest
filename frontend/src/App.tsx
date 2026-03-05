import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SortModalProvider } from './contexts/SortModalContext';
import { Navbar } from './components/Navbar';
import { SortButton } from './components/SortButton';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Discovery } from './pages/Discovery';
import { Saved } from './pages/Saved';
import { Profile } from './pages/Profile';
import { MediaDetail } from './pages/MediaDetail';
import { Login } from './pages/Login';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000 },
  },
});

function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const showNavbar = user != null && !isLoginPage;
  const isDiscovery = location.pathname === '/discovery' || location.pathname === '/';

  return (
    <>
      <main>{children}</main>
      {showNavbar && (
        <>
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
            <Navbar />
          </div>
          {isDiscovery && (
            <div className="fixed bottom-6 right-6 z-50">
              <SortButton />
            </div>
          )}
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <SortModalProvider>
            <Layout>
            <Routes>
              <Route path="/" element={<AuthRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/discovery"
                element={
                  <ProtectedRoute>
                    <Discovery />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/saved"
                element={
                  <ProtectedRoute>
                    <Saved />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/movie/:id"
                element={
                  <ProtectedRoute>
                    <MediaDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tv/:id"
                element={
                  <ProtectedRoute>
                    <MediaDetail />
                  </ProtectedRoute>
                }
              />
            </Routes>
            </Layout>
          </SortModalProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AuthRedirect() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }
  return <Navigate to={user ? '/discovery' : '/login'} replace />;
}
