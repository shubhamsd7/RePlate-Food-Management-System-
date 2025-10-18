export interface User {
  id: number;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  businessHours?: string;
  cuisineType?: string;
  createdAt?: string;
}

export interface Donation {
  id: number;
  restaurantName: string;
  foodType: string;
  quantity: number;
  address: string;
  expiresAt: string;
  status: 'available' | 'matched';
  carbonSaved: number;
  shelterId?: number;
  shelterName?: string;
  createdAt: string;
  mealCategory?: string;
  allergens?: string;
  dietaryInfo?: string;
  photoUrl?: string;
  preparationTime?: string;
}

export interface Shelter {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  capacity: number;
  points: number;
}

export interface Stats {
  totalMealsSaved: number;
  totalCarbonSaved: number;
  totalDonations: number;
  activeShelters: number;
}

export interface DonationFormData {
  restaurantName: string;
  foodType: string;
  quantity: number;
  address: string;
  expiresIn: number;
  mealCategory: string;
  allergens: string[];
  dietary: string[];
  preparationTime?: string;
}
