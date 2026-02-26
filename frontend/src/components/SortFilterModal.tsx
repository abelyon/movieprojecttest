import { X } from 'lucide-react';

export type TimeWindow = 'day' | 'week';
export type SortOption = 'popularity' | 'rating' | 'date';

interface SortFilterModalProps {
  open: boolean;
  onClose: () => void;
  timeWindow: TimeWindow;
  onTimeWindowChange: (v: TimeWindow) => void;
  sortBy: SortOption;
  onSortByChange: (v: SortOption) => void;
}

export function SortFilterModal({
  open,
  onClose,
  timeWindow,
  onTimeWindowChange,
  sortBy,
  onSortByChange,
}: SortFilterModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-2xl bg-[var(--card)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Sort & filter</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--muted)] hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--muted)]">Trending period</label>
            <div className="flex gap-2">
              {(['day', 'week'] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => onTimeWindowChange(w)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
                    timeWindow === w
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--muted)]">Sort by</label>
            <div className="flex flex-col gap-1">
              {[
                { value: 'popularity' as const, label: 'Popularity' },
                { value: 'rating' as const, label: 'Rating' },
                { value: 'date' as const, label: 'Release date' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onSortByChange(opt.value)}
                  className={`rounded-lg px-4 py-2 text-left text-sm transition ${
                    sortBy === opt.value
                      ? 'bg-[var(--accent)]/20 text-[var(--accent)]'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
