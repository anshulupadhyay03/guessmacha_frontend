import type { SVGProps } from 'react';

export interface VibrateIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
  strokeWidth?: number | string;
}

export function VibrateIcon({
  className = 'size-4 shrink-0',
  strokeWidth = 2,
  ...props
}: VibrateIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m2 8 2 2-2 2 2 2-2 2" />
      <path d="m22 8-2 2 2 2-2 2 2 2" />
      <rect width="10" height="16" x="7" y="4" rx="2" />
    </svg>
  );
}

export default VibrateIcon;
