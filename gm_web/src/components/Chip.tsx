import type { ReactNode } from 'react';

export interface ChipProps {
  label: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  variant?: 'square' | 'rounded';
  size?: 'sm' | 'md';
  ariaLabel?: string;
  role?: string;
  className?: string;
}

export default function Chip({
  label,
  selected = false,
  disabled = false,
  onClick,
  variant = 'square',
  size = 'md',
  ariaLabel,
  role = 'radio',
  className = '',
}: ChipProps) {
  const sizeStyles =
    variant === 'square'
      ? size === 'sm'
        ? 'size-9 text-sm'
        : 'size-10 sm:size-11 text-base sm:text-lg'
      : size === 'sm'
        ? 'h-8 px-3 text-xs'
        : 'h-10 px-4 text-sm';

  const shapeStyles = variant === 'square' ? 'rounded-xl' : 'rounded-full';

  const stateStyles = selected
    ? 'border-2 border-[#63d6ea] bg-[#63d6ea] text-[#00363e] font-extrabold shadow-[0_2px_12px_rgba(99,214,234,0.3)]'
    : 'border-white/10 bg-white/4 text-[#f2f5fc] hover:border-white/20 hover:bg-white/8 hover:text-white font-bold';

  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center border text-center transition cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#63d6ea] disabled:cursor-not-allowed disabled:opacity-50 ${sizeStyles} ${shapeStyles} ${stateStyles} ${className}`}
    >
      <span className="leading-none">{label}</span>
    </button>
  );
}

