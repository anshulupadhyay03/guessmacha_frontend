import type { SVGProps } from 'react';

export interface CreatePlusIconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export function CreatePlusIcon({ className, ...props }: CreatePlusIconProps) {
  return (
    <svg
      width="22"
      height="22"
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
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

export default CreatePlusIcon;
