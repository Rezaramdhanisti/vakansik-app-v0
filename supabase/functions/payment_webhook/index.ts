// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Xendit webhook callback token for authentication
const XENDIT_CALLBACK_TOKEN = "12DktP1a4WzZjdRDH2874Lns3A8lXE1NiVP3G4xEVAoM6Bx6";

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
    
    // 6. Update the order in the database
    const { data: updatedOrder, error } = await supa
      .from("orders")
      .update({
        status: orderStatus,
      })
      .eq("id", reference_id)
      .select();
    
    if (error) {
      console.error('Error updating order status:', error);
      return new Response(`Database error: ${error.message}`, { status: 500 });
    }
    
    if (!updatedOrder || updatedOrder.length === 0) {
      console.error(`Order with ID ${reference_id} not found`);
      return new Response(`Order with ID ${reference_id} not found`, { status: 404 });
    }
    
    console.log(`Successfully updated order ${reference_id} status to ${orderStatus}`);
    
    // 7. Send push notification to user (implement later)
    // TODO: Implement push notification
    
    // 8. Return success response
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
