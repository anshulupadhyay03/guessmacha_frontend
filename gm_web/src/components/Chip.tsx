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
    ? 'border-2 border-[#006875] bg-[#006875] text-white font-extrabold shadow-[0_2px_12px_rgba(0,104,117,0.25)]'
    : 'border-[#bbc9cc] bg-white text-[#171d1e] hover:border-[#006875] hover:bg-[#eff4f7] font-semibold';

  return (
    <button
      type="button"
      role={role}
      aria-checked={selected}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center border text-center transition cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006875] disabled:cursor-not-allowed disabled:opacity-50 ${sizeStyles} ${shapeStyles} ${stateStyles} ${className}`}
    >
      <span className="leading-none">{label}</span>
    </button>
  );
}

