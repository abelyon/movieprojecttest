import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUser } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const updateProfile = useMutation({
    mutationFn: () => updateUser({ username, email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setMessage({ type: 'success', text: 'Profile updated.' });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setMessage({
        type: 'error',
        text: err?.response?.data?.message ?? 'Update failed.',
      });
    },
  });

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    updateProfile.mutate();
  };

  return (
    <div className="min-h-screen pb-24 pt-4">
      <div className="mx-auto max-w-md px-4">
        <h1 className="mb-6 text-2xl font-bold text-white">Profile</h1>
        {message && (
          <div
            className={`mb-4 rounded-lg px-4 py-2 text-sm ${
              message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmitProfile} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-[var(--muted)]">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[var(--card)] px-4 py-3 text-white focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-[var(--muted)]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[var(--card)] px-4 py-3 text-white focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="w-full rounded-xl bg-[var(--accent)] py-3 font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {updateProfile.isPending ? 'Saving…' : 'Update profile'}
          </button>
        </form>
        <p className="mt-6 text-sm text-[var(--muted)]">
          Password change and other Fortify features (2FA, reset) are available via Laravel Fortify
          routes. Configure them in the backend and add forms here if needed.
        </p>
      </div>
    </div>
  );
}
