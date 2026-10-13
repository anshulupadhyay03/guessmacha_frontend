import type { SVGProps } from 'react';

export interface ArrowRightIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
  strokeWidth?: number | string;
}

export function ArrowRightIcon({
  className = 'size-4 shrink-0',
  strokeWidth = 2.25,
  ...props
}: ArrowRightIconProps) {
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
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export default ArrowRightIcon;

