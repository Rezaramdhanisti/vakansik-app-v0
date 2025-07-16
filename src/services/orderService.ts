import { supabase } from '../../lib/supabase';

// Interface for order list item with destination details
export interface OrderListItem {
  id: string;
  title: string;
  date: string;
  status: string;
  image: string;
}

/**
 * Fetch all orders for a specific user with destination details
 */
export const getUserOrdersWithDestinations = async (userId: string): Promise<OrderListItem[]> => {
  try {
    // Join orders with destinations to get the name and image_urls
    const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      trip_id,
      trip_date,
      status,
      orders_trip_id_fkey (
        name,
        image_urls
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching user orders with destinations:', error);
      return [];
    }
    // Transform the data to match the OrderListItem interface
    const orderListItems: OrderListItem[] = data.map((item: any) => {
      // Extract the first image URL from the image_urls array if it exists
      let imageUrl = '';
      // Check if we have image_urls directly on the item
      if (item.image_urls && Array.isArray(item.image_urls) && item.image_urls.length > 0) {
        imageUrl = item.image_urls[0];
      }
      // Check if we have image_urls in orders_trip_id_fkey
      else if (item.orders_trip_id_fkey && 
          item.orders_trip_id_fkey.image_urls && 
          Array.isArray(item.orders_trip_id_fkey.image_urls) && 
          item.orders_trip_id_fkey.image_urls.length > 0) {
        imageUrl = item.orders_trip_id_fkey.image_urls[0];
      }
      // Fallback to image field if it exists
      else if (item.image) {
        imageUrl = item.image;
      }
      
      return {
        id: item.id,
        title: item.title || (item.orders_trip_id_fkey && item.orders_trip_id_fkey.name ? item.orders_trip_id_fkey.name : 'Unknown Destination'),
        date: item.date || item.trip_date,
        status: item.status,
        image: imageUrl,
      };
    });
    
    return orderListItems;
  } catch (error) {
    console.error('Unexpected error fetching user orders with destinations:', error);
    return [];
  }
};

