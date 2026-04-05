/**
 * Single source of truth for marketing category chips and the browse grid.
 * API-driven categories are not available yet; add new entries here to show
 * them on Home (when `homeChip` is set) and on /categories.
 */
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Plane,
  Car,
  Bed,
  Gem,
  Shirt,
  Laptop,
  Dumbbell,
  Home,
  Landmark,
  Pill,
  UtensilsCrossed,
  BookOpen,
  Wrench,
  Shield,
  Satellite,
} from "lucide-react";

export type CategoryEntry = {
  /** Stable id for keys */
  id: string;
  /** Title on /categories */
  browseName: string;
  /** `q` param for search links */
  searchQuery: string;
  /** Illustrative review count for browse grid */
  reviews: string;
  /** Icon on the categories browse page */
  browseIcon: LucideIcon;
  /** When set, this category appears in the Home horizontal strip */
  homeChip?: {
    labelKey: string;
    icon: LucideIcon;
  };
};

export const CATEGORIES: CategoryEntry[] = [
  {
    id: "electronics",
    browseName: "Electronics & Tech",
    searchQuery: "technology",
    reviews: "4,280",
    browseIcon: Laptop,
    homeChip: { labelKey: "home.cat.tech", icon: Laptop },
  },
  {
    id: "home-garden",
    browseName: "Home & Garden",
    searchQuery: "furniture",
    reviews: "3,150",
    browseIcon: Home,
    homeChip: { labelKey: "home.cat.furniture", icon: Bed },
  },
  {
    id: "banking",
    browseName: "Banking & Finance",
    searchQuery: "bank",
    reviews: "2,890",
    browseIcon: Landmark,
    homeChip: { labelKey: "home.cat.bank", icon: Building2 },
  },
  {
    id: "travel",
    browseName: "Travel & Holidays",
    searchQuery: "travel",
    reviews: "2,640",
    browseIcon: Plane,
    homeChip: { labelKey: "home.cat.travel", icon: Plane },
  },
  {
    id: "motors",
    browseName: "Motors & Automotive",
    searchQuery: "car",
    reviews: "1,920",
    browseIcon: Car,
    homeChip: { labelKey: "home.cat.car", icon: Car },
  },
  {
    id: "health",
    browseName: "Health & Wellness",
    searchQuery: "health",
    reviews: "1,780",
    browseIcon: Pill,
  },
  {
    id: "food",
    browseName: "Food & Dining",
    searchQuery: "food",
    reviews: "3,420",
    browseIcon: UtensilsCrossed,
  },
  {
    id: "fashion",
    browseName: "Fashion & Beauty",
    searchQuery: "clothing",
    reviews: "2,100",
    browseIcon: Shirt,
    homeChip: { labelKey: "home.cat.clothing", icon: Shirt },
  },
  {
    id: "education",
    browseName: "Education & Courses",
    searchQuery: "education",
    reviews: "1,340",
    browseIcon: BookOpen,
  },
  {
    id: "professional",
    browseName: "Professional Services",
    searchQuery: "services",
    reviews: "2,560",
    browseIcon: Wrench,
  },
  {
    id: "insurance",
    browseName: "Insurance",
    searchQuery: "insurance",
    reviews: "1,650",
    browseIcon: Shield,
  },
  {
    id: "telecoms",
    browseName: "Telecoms & Broadband",
    searchQuery: "broadband",
    reviews: "1,890",
    browseIcon: Satellite,
  },
  {
    id: "jewelry",
    browseName: "Jewelry & Watches",
    searchQuery: "jewelry",
    reviews: "1,210",
    browseIcon: Gem,
    homeChip: { labelKey: "home.cat.jewelry", icon: Gem },
  },
  {
    id: "fitness",
    browseName: "Fitness & Sports",
    searchQuery: "fitness",
    reviews: "1,980",
    browseIcon: Dumbbell,
    homeChip: { labelKey: "home.cat.fitness", icon: Dumbbell },
  },
];

export const HOME_CATEGORY_LINKS = CATEGORIES.filter((c) => c.homeChip).map((c) => ({
  icon: c.homeChip!.icon,
  labelKey: c.homeChip!.labelKey,
  href: `/search?q=${encodeURIComponent(c.searchQuery)}`,
}));
