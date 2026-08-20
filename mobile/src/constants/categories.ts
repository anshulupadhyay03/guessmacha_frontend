export interface Category {
  id: string;
  label: string;
  icon: string; // emoji placeholder — swap for icon component name once icon set is wired in
  description: string;
  /** Sample seed list — for production, prefer fetching the authoritative list from backend
   *  so it can be moderated/extended without a client release. Kept here for offline fallback
   *  and for the client-side "must select a valid object" validation. */
  objects: string[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'fruits',
    label: 'Fruits',
    icon: '🍎',
    description: 'Any real-world fruit, no vegetables.',
    objects: [
      'Apple', 'Banana', 'Mango', 'Orange', 'Grapes', 'Pineapple', 'Watermelon',
      'Strawberry', 'Papaya', 'Kiwi', 'Peach', 'Cherry', 'Pear', 'Guava', 'Lychee',
    ],
  },
  {
    id: 'animals',
    label: 'Animals',
    icon: '🐾',
    description: 'Any animal — wild, domestic, or aquatic.',
    objects: [
      'Lion', 'Elephant', 'Tiger', 'Dog', 'Cat', 'Dolphin', 'Eagle', 'Kangaroo',
      'Penguin', 'Giraffe', 'Bear', 'Wolf', 'Horse', 'Rabbit', 'Fox',
    ],
  },
  {
    id: 'cities',
    label: 'Cities',
    icon: '🏙️',
    description: 'Any real-world city, no countries.',
    objects: [
      'Paris', 'Tokyo', 'New York', 'London', 'Dubai', 'Mumbai', 'Singapore',
      'Sydney', 'Rome', 'Cairo', 'Bangkok', 'Berlin', 'Toronto', 'Seoul', 'Amsterdam',
    ],
  },
  {
    id: 'movies',
    label: 'Movies',
    icon: '🎬',
    description: 'Any widely-known film title.',
    objects: [
      'Inception', 'Titanic', 'Avatar', 'Interstellar', 'Gladiator', 'The Matrix',
      'Frozen', 'Jaws', 'Up', 'Coco', 'Joker', 'Dune',
    ],
  },
  {
    id: 'cars',
    label: 'Cars',
    icon: '🚗',
    description: 'Any car make/model.',
    objects: [
      'Tesla Model 3', 'Ford Mustang', 'Toyota Corolla', 'BMW M3', 'Honda Civic',
      'Jeep Wrangler', 'Porsche 911', 'Mini Cooper', 'Range Rover', 'Ferrari 488',
    ],
  },
  {
    id: 'jobs',
    label: 'Jobs',
    icon: '💼',
    description: 'Any real profession.',
    objects: [
      'Doctor', 'Teacher', 'Pilot', 'Chef', 'Firefighter', 'Engineer', 'Lawyer',
      'Photographer', 'Nurse', 'Architect', 'Farmer', 'Musician',
    ],
  },
  {
    id: 'countries',
    label: 'Countries',
    icon: '🌍',
    description: 'Any sovereign country.',
    objects: [
      'India', 'Japan', 'Brazil', 'Canada', 'Egypt', 'France', 'Germany',
      'Australia', 'Mexico', 'South Korea', 'Italy', 'Kenya',
    ],
  },
  {
    id: 'food',
    label: 'Food',
    icon: '🍕',
    description: 'Any dish or food item, no drinks.',
    objects: [
      'Pizza', 'Sushi', 'Biryani', 'Tacos', 'Pasta', 'Burger', 'Ramen',
      'Dumplings', 'Pancakes', 'Curry', 'Falafel', 'Paella',
    ],
  },
  {
    id: 'sports',
    label: 'Sports',
    icon: '⚽',
    description: 'Any sport played competitively.',
    objects: [
      'Football', 'Basketball', 'Cricket', 'Tennis', 'Badminton', 'Swimming',
      'Boxing', 'Golf', 'Volleyball', 'Table Tennis', 'Rugby', 'Chess',
    ],
  },
  {
    id: 'programming_languages',
    label: 'Programming Languages',
    icon: '💻',
    description: 'Any programming language.',
    objects: [
      'JavaScript', 'Python', 'TypeScript', 'Java', 'C++', 'Swift', 'Kotlin',
      'Go', 'Rust', 'Ruby', 'PHP', 'Dart',
    ],
  },
];

export const getCategoryById = (id: string): Category | undefined =>
  CATEGORIES.find((c) => c.id === id);

export default CATEGORIES;