import { Compass, Bookmark, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  useAuth();
  const location = useLocation();
  const nav = [
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/discovery', label: 'Discovery', icon: Compass },
    { to: '/saved', label: 'Saved', icon: Bookmark },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[var(--card)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-lg justify-around px-4 py-2">
        {nav.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to || (to === '/discovery' && location.pathname === '/');
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-4 py-2 transition ${isActive ? 'text-[var(--accent)]' : 'text-[var(--muted)] hover:text-white'}`}
            >
              <Icon size={22} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
