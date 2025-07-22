import supabase from './supabaseClient';

// Define the type for the activity in the itinerary
export type Activity = {
  icon: string;
  title: string;
  description: string;
};

// Define the type for a day in the itinerary
export type ItineraryDay = {
  day: string;
  activities: Activity[];
};

export interface Destination {
  id: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  image_urls: string[];
  price_information?: string;
  itinerary?: ItineraryDay[];
  meeting_point?: string;
  budget_band?: string;
  location?: string;
  category?: string;
  available_dates?: Record<string, Record<string, number[]>>; 
  is_need_ktp: boolean;
}

export async function fetchDestinations() {
  const { data, error } = await supabase
    .from('destinations')
    .select('id, name, description, price, rating, reviews, image_urls, price_information, itinerary, meeting_point, budget_band, category, available_dates, is_need_ktp');

  if (error) throw error;
  return data as Destination[];
}
