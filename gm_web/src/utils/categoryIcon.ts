export const DEFAULT_CATEGORY_ICON_URL = './category-icons/icon-default.svg';

export interface CategoryIconSource {
  iconKey?: string | null;
  icon_key?: string | null;
  name?: string | null;
}

const ICON_KEY_TO_FILE: Record<string, string> = {
  movies: 'icon-movies.svg',
  movie: 'icon-movies.svg',
  cinema: 'icon-movies.svg',
  foods: 'icon-foods-dishes.svg',
  food: 'icon-foods-dishes.svg',
  'foods-dishes': 'icon-foods-dishes.svg',
  'foods and dishes': 'icon-foods-dishes.svg',
  animals: 'icon-animal.svg',
  animal: 'icon-animal.svg',
  countries: 'icon-countries.svg',
  country: 'icon-countries.svg',
  sports: 'icon-sports.svg',
  sport: 'icon-sports.svg',
  bollywood: 'icon-bollywood.svg',
  cars: 'icon-cars-supercars.svg',
  supercars: 'icon-cars-supercars.svg',
  'cars-supercars': 'icon-cars-supercars.svg',
  cartoons: 'icon-cartoons.svg',
  cartoon: 'icon-cartoons.svg',
  cricket: 'icon-cricket-players.svg',
  'cricket-players': 'icon-cricket-players.svg',
  football: 'icon-football-players.svg',
  'football-players': 'icon-football-players.svg',
  fruits: 'icon-fruits-vegetables.svg',
  vegetables: 'icon-fruits-vegetables.svg',
  'fruits-vegetables': 'icon-fruits-vegetables.svg',
  brands: 'icon-global-brands.svg',
  'global-brands': 'icon-global-brands.svg',
  shows: 'icon-indian-shows.svg',
  'indian-shows': 'icon-indian-shows.svg',
  'international-shows': 'icon-international-shows.svg',
  mythology: 'icon-mythology-legends.svg',
  legends: 'icon-mythology-legends.svg',
  'mythology-legends': 'icon-mythology-legends.svg',
  professions: 'icon-professions.svg',
  profession: 'icon-professions.svg',
  'south-indian-movies': 'icon-south-indian-movies.svg',
  space: 'icon-space-astronomy.svg',
  astronomy: 'icon-space-astronomy.svg',
  'space-astronomy': 'icon-space-astronomy.svg',
};

/**
 * Resolves the relative path to the local SVG icon in /category-icons.
 *
 * 1. Checks explicit icon key mapping.
 * 2. If `iconKey` (or `icon_key`) is present, trims leading slashes and appends `.svg` if needed.
 * 3. If `iconKey` is missing or invalid, attempts keyword matching against `categoryName`.
 * 4. Returns DEFAULT_CATEGORY_ICON_URL as fallback.
 */
export function getCategoryIconUrl(
  iconKeyOrCategory?: string | null | CategoryIconSource,
  categoryName?: string | null,
): string | null {
  let rawKey: string | null | undefined = null;
  let name = categoryName?.toLowerCase().trim() || '';

  if (typeof iconKeyOrCategory === 'object' && iconKeyOrCategory !== null) {
    rawKey = iconKeyOrCategory.iconKey ?? iconKeyOrCategory.icon_key;
    if (!name && iconKeyOrCategory.name) {
      name = iconKeyOrCategory.name.toLowerCase().trim();
    }
  } else if (typeof iconKeyOrCategory === 'string') {
    rawKey = iconKeyOrCategory;
  }

  if (rawKey && typeof rawKey === 'string') {
    const trimmedKey = rawKey.trim().replace(/^\/+/, '');
    const cleanKey = trimmedKey.replace(/\.svg$/i, '').toLowerCase();

    if (ICON_KEY_TO_FILE[cleanKey]) {
      return `./category-icons/${ICON_KEY_TO_FILE[cleanKey]}`;
    }

    if (trimmedKey.startsWith('icon-')) {
      const fileName = trimmedKey.endsWith('.svg') ? trimmedKey : `${trimmedKey}.svg`;
      return `./category-icons/${fileName}`;
    }

    if (ICON_KEY_TO_FILE[`icon-${cleanKey}`]) {
      return `./category-icons/${ICON_KEY_TO_FILE[`icon-${cleanKey}`]}`;
    }

    const fileName = trimmedKey.endsWith('.svg') ? trimmedKey : `${trimmedKey}.svg`;
    return `./category-icons/${fileName}`;
  }

  if (name) {
    if (name.includes('animal')) return './category-icons/icon-animal.svg';
    if (name.includes('movie') || name.includes('bollywood')) return './category-icons/icon-bollywood.svg';
    if (name.includes('sport')) return './category-icons/icon-sports.svg';
    if (name.includes('countr')) return './category-icons/icon-countries.svg';
    if (name.includes('food') || name.includes('dish')) return './category-icons/icon-foods-dishes.svg';
    if (name.includes('cricket')) return './category-icons/icon-cricket-players.svg';
    if (name.includes('football')) return './category-icons/icon-football-players.svg';
    if (name.includes('car')) return './category-icons/icon-cars-supercars.svg';
    if (name.includes('cartoon')) return './category-icons/icon-cartoons.svg';
    if (name.includes('fruit') || name.includes('vegetable')) return './category-icons/icon-fruits-vegetables.svg';
    if (name.includes('brand')) return './category-icons/icon-global-brands.svg';
    if (name.includes('indian show') || name.includes('hindi show')) return './category-icons/icon-indian-shows.svg';
    if (name.includes('international show') || name.includes('tv show') || name.includes('series')) return './category-icons/icon-international-shows.svg';
    if (name.includes('mytholog') || name.includes('legend')) return './category-icons/icon-mythology-legends.svg';
    if (name.includes('profession') || name.includes('job')) return './category-icons/icon-professions.svg';
    if (name.includes('south indian') || name.includes('tollywood') || name.includes('kollywood')) return './category-icons/icon-south-indian-movies.svg';
    if (name.includes('space') || name.includes('astronomy')) return './category-icons/icon-space-astronomy.svg';
  }

  return DEFAULT_CATEGORY_ICON_URL;
}
