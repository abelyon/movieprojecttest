import { SlidersHorizontal } from 'lucide-react';
import { useSortModal } from '../contexts/SortModalContext';

export function SortButton() {
  const { openSortModal } = useSortModal();

  return (
    <button
      type="button"
      onClick={openSortModal}
      className="flex size-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[var(--card)]/95 shadow-lg backdrop-blur transition hover:border-[var(--accent)] hover:bg-white/5 text-[var(--muted)] hover:text-white"
      aria-label="Sort and filter"
    >
      <SlidersHorizontal size={22} />
    </button>
  );
}
