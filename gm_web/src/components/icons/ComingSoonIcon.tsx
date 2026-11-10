import type { SVGProps } from 'react';

export interface ComingSoonIconProps extends SVGProps<SVGSVGElement> {
  id: string;
  className?: string;
}

export function ComingSoonIcon({ id, className, ...props }: ComingSoonIconProps) {
  if (id === 'ranked_games') {
    return (
      <svg
        width="20"
        height="20"
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
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6m12 5h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M6 4h12v5a6 6 0 0 1-12 0V4Z" />
        <path d="M12 15v3m-3 3h6M9 21l3-3 3 3" />
      </svg>
    );
  }

  if (id === 'daily_challenges') {
    return (
      <svg
        width="20"
        height="20"
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
        <rect x="3" y="4" width="18" height="18" rx="3" />
        <path d="M8 2v4M16 2v4M3 10h18M12 13v3l2 1.5" />
      </svg>
    );
  }

  return (
    <svg
      width="20"
      height="20"
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
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
    </svg>
  );
}

export default ComingSoonIcon;
