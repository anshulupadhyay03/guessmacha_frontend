import type { SVGProps } from 'react';

export interface ChevronIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export function ChevronIcon({ className, ...props }: ChevronIconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default ChevronIcon;
