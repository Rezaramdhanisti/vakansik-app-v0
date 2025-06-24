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
}

export async function fetchDestinations() {
  const { data, error } = await supabase
    .from('destinations')
    .select('name, description, price, rating, reviews, image_urls, price_information, itinerary, meeting_point, budget_band, category');

  if (error) throw error;
  return data as Destination[];
}
