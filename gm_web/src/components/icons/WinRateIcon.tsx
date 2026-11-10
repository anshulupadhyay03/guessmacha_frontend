import type { SVGProps } from 'react';

export interface WinRateIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export function WinRateIcon({ className, ...props }: WinRateIconProps) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M4 20V10M10 20V4M16 20v-6M22 20H2" />
    </svg>
  );
}

export default WinRateIcon;
