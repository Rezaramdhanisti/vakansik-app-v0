import supabase from './supabaseClient';

// Interface for order list item with destination details
export interface OrderListItem {
  id: string;
  title: string;
  date: string;
  status: string;
  image: string;
}

// Interface for detailed order information
export interface OrderDetail {
  id: string;
  name: string;
  trip_date: string;
  meeting_point: string;
  amount_idr: number;
  status: string;
  image_url?: string;
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

/**
 * Fetch detailed information for a specific order
 */
export const getOrderDetail = async (orderId: string): Promise<OrderDetail | null> => {
  try {
    // Define the type for the response data
    type OrderResponse = {
      id: string;
      trip_date: string;
      amount_idr: number;
      status: string;
      orders_trip_id_fkey: {
        name: string;
        meeting_point: string;
        image_urls?: string[];
      };
    };

    // Join orders with destinations to get the name, meeting point, and other details
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        trip_date,
        amount_idr,
        status,
        orders_trip_id_fkey:trip_id(name, meeting_point, image_urls)
      `)
      .eq('id', orderId)
      .single<OrderResponse>();

    if (error) {
      console.error('Error fetching order detail:', error);
      return null;
    }

    if (!data) {
      console.error('No order found with ID:', orderId);
      return null;
    }

    // Transform the data to match the OrderDetail interface
    const orderDetail: OrderDetail = {
      id: data.id,
      name: data.orders_trip_id_fkey?.name || '',
      trip_date: data.trip_date,
      meeting_point: data.orders_trip_id_fkey?.meeting_point || '',
      amount_idr: data.amount_idr,
      status: data.status,
      // Get the first image URL if available
      image_url: data.orders_trip_id_fkey?.image_urls && 
                Array.isArray(data.orders_trip_id_fkey.image_urls) && 
                data.orders_trip_id_fkey.image_urls.length > 0 ? 
                data.orders_trip_id_fkey.image_urls[0] : undefined
    };

    return orderDetail;
  } catch (error) {
    console.error('Unexpected error fetching order detail:', error);
    return null;
  }
};

