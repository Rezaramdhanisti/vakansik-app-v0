import supabase from './supabaseClient';

export interface Destination {
  name: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  image_urls: string[];
}

export async function fetchDestinations() {
  const { data, error } = await supabase
    .from('destinations')
    .select('name, description, price, rating, reviews, image_urls');

  if (error) throw error;
  return data as Destination[];
}
