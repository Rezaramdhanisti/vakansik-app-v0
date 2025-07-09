// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

Deno.serve(async (req) => {
  const supa = createClient(
    Deno.env.get("VAKANSIK_URL_BASE")!,
    Deno.env.get("VAKANSIK_ANON_KEY_BASE")!,
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
  );

  // 1. Auth check
  const { data: { user }, error: authError } = await supa.auth.getUser();
  if (!user || authError) return new Response("Unauthorized", { status: 401 });

  // 2. Parse request
  const { trip_id, trip_date, joined_users } = await req.json();
  if (!trip_id || !trip_date || !joined_users?.length) {
    return new Response("Missing required fields", { status: 400 });
  }

  // 3. Get trip data from destinations table
  const { data: trip, error: tripErr } = await supa
    .from("destinations")
    .select("price, name")
    .eq("id", trip_id)
    .single();
  if (!trip || tripErr) return new Response("Trip not found", { status: 404 });

  // 4. Create order record
  const order_id = crypto.randomUUID();
  await supa.from("orders").insert({
    id: order_id,
    user_id: user.id,
    trip_id,
    trip_date,
    amount_idr: trip.price,
    status: "PENDING",
    channel_code: "SHOPEEPAY",
    joined_users, // store raw JSON array
  });

  // 5. Call Xendit
  const xenditRes = await fetch("https://api.xendit.co/v3/payment_requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-version": "2024-11-11",
      "Authorization": "Basic " + btoa(Deno.env.get("XENDIT_SECRET_BASE") + ":"),
    },
    body: JSON.stringify({
      reference_id: order_id,
      type: "PAY",
      country: "ID",
      currency: "IDR",
      request_amount: trip.price,
      channel_code: "SHOPEEPAY",
      channel_properties: {
        display_name: "Vakansik", // Change to your brand
        account_mobile_number: joined_users[0].phone_number,
        success_return_url: "myapp://payment-success",
      }
    })
  }).then(r => r.json());

  // 6. Update order with payment_request_id
  await supa.from("orders")
    .update({ payment_request_id: xenditRes.payment_request_id })
    .eq("id", order_id);

  // 7. Return result
  return Response.json({
    order_id,
    actions: xenditRes.actions || [],
  });
});
