// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

Deno.serve(async (req) => {
  try {
    console.log('Payment request function invoked');
    
    const supa = createClient(
      Deno.env.get("VAKANSIK_URL_BASE")!,
      Deno.env.get("VAKANSIK_SERVICE_ROLE_KEY_BASE")!
    );

    // Extract user_id from request body instead of auth check
    console.log('Using service role authentication - bypassing auth check');


    // 2. Parse request
    const requestBody = await req.json();
    console.log('Request body received:', JSON.stringify(requestBody));
    
    const { 
      trip_id, 
      trip_date, 
      joined_users, 
      payment_number, 
      payment_method,
      user_id // Extract user_id from request body
    } = requestBody;
    
    if (!user_id) {
      console.error('Missing user_id in request');
      return new Response("Missing user_id in request", { status: 400 });
    }
    console.log('Using user_id from request:', user_id);
    
    if (!trip_id || !trip_date || !joined_users?.length) {
      console.error('Missing required fields');
      return new Response("Missing required fields", { status: 400 });
    }

    // 3. Get trip data from destinations table
    const { data: trip, error: tripErr } = await supa
      .from("destinations")
      .select("price, name")
      .eq("id", trip_id)
      .single();
    
    if (tripErr) {
      console.error('Trip fetch error:', tripErr);
      return new Response(`Trip fetch error: ${tripErr.message}`, { status: 500 });
    }
    
    if (!trip) {
      console.error('Trip not found');
      return new Response("Trip not found", { status: 404 });
    }
    
    console.log('Trip data fetched:', trip);

    // Determine channel code based on payment method
    let channel_code = "SHOPEEPAY"; // Default
    if (payment_method === 'ovo') {
      channel_code = "OVO";
    } else if (payment_method === 'shopee') {
      channel_code = "SHOPEEPAY";
    } else if (payment_method === 'qris') {
      channel_code = "QRIS";
    }
    
    console.log('Using channel code:', channel_code);

    // 4. Create order record
    const order_id = crypto.randomUUID();
    console.log('Generated order_id:', order_id);
    
    const orderData = {
      id: order_id,
      user_id: user_id, // Use user_id from request body
      trip_id,
      trip_date,
      amount_idr: trip.price,
      status: "PENDING",
      channel_code,
      joined_users, // store raw JSON array
    };
 
    
    const { error: insertError } = await supa.from("orders").insert(orderData);
    
    if (insertError) {
      console.error('Order insert error:', insertError);
      return new Response(`Database insert error: ${insertError.message}`, { status: 500 });
    }
    
    console.log('Order record created successfully');

    // 5. Call Xendit
    console.log('Calling Xendit API...');
    
    const xenditPayload = {
      reference_id: order_id,
      type: "PAY",
      country: "ID",
      currency: "IDR",
      request_amount: trip.price,
      channel_code,
      channel_properties: channel_code === "QRIS" ? {
        display_name: "Vakansik"
      } : channel_code === "OVO" ? {
        account_mobile_number: payment_number
      } : {
        display_name: "Vakansik", // Change to your brand
        account_mobile_number: payment_number,
        success_return_url: "vakansik://payment-success",
        cancel_return_url: "vakansik://payment-cancel",
        failure_return_url: "vakansik://payment-failed"
      }
    };
    
    console.log('Xendit payload:', JSON.stringify(xenditPayload));
    
    const xenditResponse = await fetch("https://api.xendit.co/v3/payment_requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-version": "2024-11-11",
        "Authorization": "Basic " + btoa(Deno.env.get("XENDIT_SECRET_BASE") + ":"),
      },
      body: JSON.stringify(xenditPayload)
    });
    
    if (!xenditResponse.ok) {
      const errorText = await xenditResponse.text();
      console.error('Xendit API error:', errorText);
      
      // Update order status to FAILED
      await supa.from("orders")
        .update({ status: "FAILED", error_message: errorText })
        .eq("id", order_id);
        
      return new Response(`Xendit API error: ${errorText}`, { status: xenditResponse.status });
    }
    
    const xenditRes = await xenditResponse.json();
    console.log('Xendit response:', JSON.stringify(xenditRes));

    // 6. Update order with payment_request_id and response data
    if (xenditRes.payment_request_id) {
      console.log('Updating order with payment_request_id:', xenditRes.payment_request_id);
      
      try {
        // Combine all updates into a single operation to ensure atomic update
        const updateData = {
          payment_request_id: xenditRes.payment_request_id,  // No String() conversion needed
          xendit_response: xenditRes,                        // Send as raw object for JSONB column
        };
        
        console.log('Update data being sent:', JSON.stringify(updateData));
        
        // Use a single update operation with all fields
        const { data, error } = await supa.from("orders")
          .update(updateData)
          .eq("id", order_id)
          .select();
          
        if (error) {
          console.error('Error updating order with Xendit data:', error);
          throw error;
        } else {
          console.log('Successfully updated order with Xendit data:', data);
        }
      } catch (error) {
        console.error('Exception during order update:', error);
      }
    } else {
      console.error('No payment_request_id in Xendit response');
    }

    // 7. Return result
    console.log('Returning success response');
    return Response.json({
      order_id,
      ...xenditRes, // Include the full Xendit response
    });
  } catch (error) {
    console.error('Unhandled error in payment request function:', error);
    return new Response(`Server error: ${error.message}`, { status: 500 });
  }
});
