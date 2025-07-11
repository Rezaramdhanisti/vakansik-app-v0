// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

Deno.serve(async (req) => {
  try {
    console.log('Payment request function invoked');
    
    const supa = createClient(
      Deno.env.get("VAKANSIK_URL_BASE")!,
      Deno.env.get("VAKANSIK_ANON_KEY_BASE")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    // 1. Auth check
    const { data: { user }, error: authError } = await supa.auth.getUser();
    if (!user || authError) {
      console.error('Auth error:', authError);
      return new Response("Unauthorized", { status: 401 });
    }
    console.log('User authenticated:', user.id);

    // 2. Parse request
    const requestBody = await req.json();
    console.log('Request body received:', JSON.stringify(requestBody));
    
    const { 
      trip_id, 
      trip_date, 
      joined_users, 
      payment_number, 
      payment_method 
    } = requestBody;
    
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
    if (payment_method === 'gopay') {
      channel_code = "GOPAY";
    } else if (payment_method === 'shopee') {
      channel_code = "SHOPEEPAY";
    }
    
    console.log('Using channel code:', channel_code);

    // 4. Create order record
    const order_id = crypto.randomUUID();
    console.log('Generated order_id:', order_id);
    
    const orderData = {
      id: order_id,
      user_id: user.id,
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
      channel_properties: {
        display_name: "Vakansik", // Change to your brand
        account_mobile_number: payment_number,
        success_return_url: "myapp://payment-success",
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

    // 6. Update order with payment_request_id
    if (xenditRes.payment_request_id) {
      console.log('Updating order with payment_request_id:', xenditRes.payment_request_id);
      
      // Try updating with explicit text for payment_request_id and raw object for xendit_response
      try {
        // Step 1: Save just the payment_request_id as text
        const { error: idError } = await supa.from("orders")
          .update({ payment_request_id: String(xenditRes.payment_request_id) })
          .eq("id", order_id);
          
        if (idError) {
          console.error('Error updating payment_request_id:', idError);
        } else {
          console.log('Successfully updated payment_request_id');
        }
        
        // Step 2: Save xendit_response as a separate update
        const { error: jsonError } = await supa.from("orders")
          .update({ xendit_response: xenditRes })
          .eq("id", order_id);
          
        if (jsonError) {
          console.error('Error updating xendit_response as object:', jsonError);
          
          // Try with stringified JSON if object approach fails
          const { error: stringError } = await supa.from("orders")
            .update({ xendit_response: JSON.stringify(xenditRes) })
            .eq("id", order_id);
            
          if (stringError) {
            console.error('Error updating stringified xendit_response:', stringError);
          } else {
            console.log('Successfully updated xendit_response as string');
          }
        } else {
          console.log('Successfully updated xendit_response as object');
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
      actions: xenditRes.actions || [],
    });
  } catch (error) {
    console.error('Unhandled error in payment request function:', error);
    return new Response(`Server error: ${error.message}`, { status: 500 });
  }
});
