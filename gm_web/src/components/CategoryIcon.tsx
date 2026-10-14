import { useState } from 'react';
import {
  DEFAULT_CATEGORY_ICON_URL,
  getCategoryIconUrl,
  type CategoryIconSource,
} from '../utils/categoryIcon';

export interface CategoryIconProps {
  category?: CategoryIconSource | null;
  iconKey?: string | null;
  name?: string | null;
  className?: string;
  alt?: string;
}

export default function CategoryIcon({
  category,
  iconKey,
  name,
  className = 'size-11 object-contain select-none pointer-events-none',
  alt,
}: CategoryIconProps) {
  const [hasError, setHasError] = useState(false);

  const effectiveIconKey = iconKey ?? category?.iconKey ?? category?.icon_key;
  const effectiveName = name ?? category?.name;
  const iconUrl = getCategoryIconUrl(effectiveIconKey, effectiveName);
  const src = !hasError && iconUrl ? iconUrl : DEFAULT_CATEGORY_ICON_URL;

  return (
    <img
      src={src}
      alt={alt ?? effectiveName ?? 'Category'}
      className={className}
      loading="lazy"
      onError={() => {
        if (!hasError) setHasError(true);
      }}
    />
  );
}

