import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginRegister } from './LoginRegister';

export function Login() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/discovery" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center pb-24 pt-8">
      <LoginRegister />
    </div>
  );
}
