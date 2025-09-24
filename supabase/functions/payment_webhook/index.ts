// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { sendPaymentSuccessEmail, PaymentSuccessEmailData, sendAdminNotificationEmail, AdminNotificationEmailData } from "./email-service.ts";

// Xendit webhook callback token for authentication
const XENDIT_CALLBACK_TOKEN = Deno.env.get("XENDIT_CALLBACK_TOKEN_V2");

// Required environment variables for this function:
// - XENDIT_CALLBACK_TOKEN_V2: Xendit webhook callback token
// - VAKANSIK_URL_BASE: Supabase project URL
// - VAKANSIK_SERVICE_ROLE_KEY_BASE: Supabase service role key
// - RESEND_KEY: Resend API key for sending emails
// - ADMIN_EMAIL: Admin email address(es) to receive payment notifications
//   (single email: "admin@example.com" or multiple: "admin1@example.com,admin2@example.com")

// Define webhook event types
type XenditWebhookEvent = 
  | "payment.capture"
  | "payment.succeeded"
  | "payment.failed"
  | "payment.expired";

// Define webhook payload structure
interface XenditWebhookPayload {
  created: string;
  business_id: string;
  event: XenditWebhookEvent;
  api_version: string;
  data: {
    payment_id: string;
    reference_id: string;
    payment_request_id: string;
    status: string;
    request_amount: number;
    currency: string;
    [key: string]: any; // Allow other fields
  };
}

Deno.serve(async (req) => {
  try {
    console.log('Payment webhook function invoked');
    
    // Initialize Supabase client with service role key for admin access
    const supa = createClient(
      Deno.env.get("VAKANSIK_URL_BASE")!,
      Deno.env.get("VAKANSIK_SERVICE_ROLE_KEY_BASE")!
    );
    
    // 1. Verify request method
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }
    
    // 2. Verify the webhook signature from Xendit
    const callbackToken = req.headers.get("x-callback-token");
    
    if (!callbackToken || callbackToken !== XENDIT_CALLBACK_TOKEN) {
      console.error('Invalid or missing callback token');
      return new Response("Unauthorized", { status: 401 });
    }
    
    console.log('Webhook authentication successful');
    
    // 3. Parse webhook payload
    const payload = await req.json() as XenditWebhookPayload;
    console.log('Received webhook payload:', JSON.stringify(payload));
    
    // 4. Process based on event type
    const { event, data } = payload;
    const { reference_id, payment_request_id, status } = data;
    
    console.log(`Processing ${event} event for order ${reference_id}`);
    
    // 5. Update order status in database
    let orderStatus;
    
    switch (event) {
      case "payment.capture":
      case "payment.succeeded":
        orderStatus = "COMPLETED";
        break;
      case "payment.failed":
        orderStatus = "FAILED";
        break;
      case "payment.expired":
        orderStatus = "EXPIRED";
        break;
      default:
        orderStatus = "PENDING";
    }
    
    // 6. Update the order in the database and get order details with user info
    const { data: updatedOrder, error } = await supa
      .from("orders")
      .update({
        status: orderStatus,
      })
      .eq("id", reference_id)
      .select(`
        id,
        user_id,
        trip_id,
        trip_date,
        amount_idr,
        status,
        joined_users,
        orders_trip_id_fkey:trip_id(
          name,
          meeting_point
        )
      `);
    
    if (error) {
      console.error('Error updating order status:', error);
      return new Response(`Database error: ${error.message}`, { status: 500 });
    }
    
    if (!updatedOrder || updatedOrder.length === 0) {
      console.error(`Order with ID ${reference_id} not found`);
      return new Response(`Order with ID ${reference_id} not found`, { status: 404 });
    }
    
    console.log(`Successfully updated order ${reference_id} status to ${orderStatus}`);
    
    // 7. Get user email from auth.users table
    const order = updatedOrder[0];
    const { data: userData, error: userError } = await supa.auth.admin.getUserById(order.user_id);
    
    if (userError) {
      console.error('Error fetching user data:', userError);
      // Don't fail the webhook if we can't get user email
    } else if (userData?.user?.email) {
      console.log('User email found:', userData.user.email);
      
      // 8. Send email notification only for successful payments
      if (orderStatus === "COMPLETED") {
        const emailData: PaymentSuccessEmailData = {
          userEmail: userData.user.email,
          userName: userData.user.user_metadata?.full_name || userData.user.email.split('@')[0],
          orderId: order.id,
          tripName: order.orders_trip_id_fkey?.name || 'Unknown Trip',
          tripDate: order.trip_date,
          amount: order.amount_idr,
          meetingPoint: order.orders_trip_id_fkey?.meeting_point || 'TBA',
        };
        
        const emailSent = await sendPaymentSuccessEmail(emailData);
        if (emailSent) {
          console.log('Payment success email sent successfully');
        } else {
          console.error('Failed to send payment success email');
        }

        // Send admin notification for successful payments
        const adminNotificationData: AdminNotificationEmailData = {
          orderId: order.id,
          userName: userData.user.user_metadata?.full_name || userData.user.email.split('@')[0],
          userEmail: userData.user.email,
          tripName: order.orders_trip_id_fkey?.name || 'Unknown Trip',
          tripDate: order.trip_date,
          amount: order.amount_idr,
          meetingPoint: order.orders_trip_id_fkey?.meeting_point || 'TBA',
          joinedUsers: order.joined_users || [],
        };
        
        const adminEmailSent = await sendAdminNotificationEmail(adminNotificationData);
        if (adminEmailSent) {
          console.log('Admin notification email sent successfully');
        } else {
          console.error('Failed to send admin notification email');
        }
      } else {
        console.log(`No email sent for payment status: ${orderStatus}`);
      }
    } else {
      console.log('No user email found for user ID:', order.user_id);
    }
    
    // 9. Send push notification to user (implement later)
    // TODO: Implement push notification
    
    // 10. Return success response
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Order ${reference_id} status updated to ${orderStatus}` 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(`Server error: ${error.message}`, { status: 500 });
  }
});
