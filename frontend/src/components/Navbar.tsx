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
    <nav>
      <div className="flex h-14 shrink-0 items-center gap-1 rounded-full border border-white/10 bg-[var(--card)]/95 px-4 shadow-lg backdrop-blur">
        {nav.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to || (to === '/discovery' && location.pathname === '/');
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center justify-center rounded-full p-3 transition ${isActive ? 'text-neutral-50' : 'text-neutral-600 hover:text-neutral-50'}`}
              aria-label={label}
            >
              <Icon size={22} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
