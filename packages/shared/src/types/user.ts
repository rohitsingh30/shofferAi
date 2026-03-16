export interface UserProfile {
  id: string;
  userId: string;
  phone?: string;
  addresses: SavedAddress[];
  preferences: UserPreferences;
}

export interface SavedAddress {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface UserPreferences {
  defaultCity?: string;
  dietaryPreferences?: string[];
  hotelPreferences?: {
    starRating?: number;
    priceRange?: { min: number; max: number };
    amenities?: string[];
  };
  preferredPaymentMethod?: string;
  language?: string;
}
