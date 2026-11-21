import type { PuzzleInformationItem, PuzzleItem } from '../features/chooseSecret/types';

interface SecretInfoTooltipProps {
  puzzle: PuzzleItem;
  categoryName?: string;
  onClose: () => void;
}

const LONG_TEXT_CHAR_THRESHOLD = 48;

/**
 * Determines whether an information item should span full width in the grid.
 * Dynamically checks content length and structure rather than assuming
 * fixed label names (e.g. a cast with only two people or a concise premise remains compact).
 */
function isLongField(label: string, value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  const trimmedValue = value.trim();

  // Multi-line text or values exceeding character threshold span full width
  if (trimmedValue.includes('\n') || trimmedValue.length > LONG_TEXT_CHAR_THRESHOLD) {
    return true;
  }

  // Combined length check if label and value together would be crowded in one column
  if (label.trim().length + trimmedValue.length > 60) {
    return true;
  }

  return false;
}

export default function SecretInfoTooltip({
  puzzle,
  categoryName,
  onClose,
}: SecretInfoTooltipProps) {
  const information: PuzzleInformationItem[] = puzzle.information ?? [];
  const hasInformation = Array.isArray(information) && information.length > 0;
  const cleanCategory = categoryName && categoryName !== 'Category' ? categoryName : '';

  return (
    <div
      role="tooltip"
      aria-label={`Details for ${puzzle.name}`}
      className="relative w-full rounded-xl border border-primary/25 bg-surface-container-high/90 p-3 sm:p-3.5 shadow-sm text-left text-on-surface animate-in fade-in slide-in-from-top-1 duration-150"
    >
      {/* Speech-bubble arrow notch pointing up to the (?) button */}
      <div
        aria-hidden="true"
        className="absolute -top-1.5 left-7 size-3 rotate-45 border-t border-l border-primary/25 bg-surface-container-high"
      />

      {/* Tooltip Header Bar */}
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-outline-variant/20">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Quick Details
          </span>
          {cleanCategory && (
            <span className="text-[11px] text-on-surface-variant font-medium truncate">
              • {cleanCategory}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close details"
          title="Close details"
          className="grid size-6 shrink-0 place-items-center rounded-full text-on-surface-variant/70 hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
        >
          <svg
            className="size-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Tooltip Content */}
      {hasInformation ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {information.map((item, index) => {
            const isLong = isLongField(item.label, item.value);

            return (
              <div
                key={`${item.label}-${index}`}
                className={`rounded-lg border border-outline-variant/20 bg-surface-container-lowest/80 p-2 sm:p-2.5 ${
                  isLong ? 'col-span-full' : ''
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-primary uppercase tracking-wider mb-0.5">
                  <span>{item.label}</span>
                </div>
                <p className="text-xs font-medium text-on-surface leading-relaxed break-words">
                  {item.value || 'N/A'}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-2 text-center text-xs text-on-surface-variant">
          No additional details available for this secret.
        </div>
      )}
    </div>
  );
}
