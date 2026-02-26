import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LoginRegister() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname ?? '/discovery';
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (password !== passwordConfirmation) {
          setError('Passwords do not match.');
          return;
        }
        await register(name, email, password, passwordConfirmation);
      }
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const res = err as { response?: { data?: { message?: string } } };
      setError(res?.response?.data?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4">
      <h2 className="mb-4 text-xl font-semibold text-white">
        {isLogin ? 'Sign in' : 'Create account'}
      </h2>
      {error && (
        <div className="mb-4 rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label htmlFor="name" className="mb-1 block text-sm text-[var(--muted)]">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={!isLogin}
              className="w-full rounded-xl border border-white/10 bg-[var(--card)] px-4 py-3 text-white focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        )}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm text-[var(--muted)]">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-[var(--card)] px-4 py-3 text-white focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm text-[var(--muted)]">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-[var(--card)] px-4 py-3 text-white focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
        {!isLogin && (
          <div>
            <label htmlFor="password_confirmation" className="mb-1 block text-sm text-[var(--muted)]">
              Confirm password
            </label>
            <input
              id="password_confirmation"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required={!isLogin}
              className="w-full rounded-xl border border-white/10 bg-[var(--card)] px-4 py-3 text-white focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--accent)] py-3 font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          {loading ? '…' : isLogin ? 'Sign in' : 'Register'}
        </button>
      </form>
      <button
        type="button"
        onClick={() => setIsLogin(!isLogin)}
        className="mt-4 w-full text-center text-sm text-[var(--muted)] hover:text-[var(--accent)]"
      >
        {isLogin ? 'Need an account? Register' : 'Already have an account? Sign in'}
      </button>
    </div>
  );
}
