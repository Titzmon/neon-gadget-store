import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id });

    const { items, shipping_address } = await req.json();
    logStep("Request body parsed", { itemCount: items?.length });

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Invalid items: must be a non-empty array");
    }

    // Extract product IDs and validate quantities
    const productIds: string[] = [];
    const quantityMap: Record<string, number> = {};
    
    for (const item of items) {
      if (!item.product_id || typeof item.product_id !== 'string') {
        throw new Error("Invalid item: missing or invalid product_id");
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1 || !Number.isInteger(item.quantity)) {
        throw new Error("Invalid item: quantity must be a positive integer");
      }
      productIds.push(item.product_id);
      quantityMap[item.product_id] = item.quantity;
    }

    // Fetch actual product prices from database - SERVER-SIDE PRICE VALIDATION
    const { data: dbProducts, error: productsError } = await supabaseClient
      .from('products')
      .select('id, name, price, images, is_active')
      .in('id', productIds);

    if (productsError) {
      logStep("Database error fetching products", { error: productsError.message });
      throw new Error("Failed to fetch product information");
    }

    if (!dbProducts || dbProducts.length !== productIds.length) {
      const foundIds = dbProducts?.map(p => p.id) || [];
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      logStep("Product validation failed", { missingIds });
      throw new Error("One or more products not found");
    }

    // Validate all products are active
    const inactiveProducts = dbProducts.filter(p => !p.is_active);
    if (inactiveProducts.length > 0) {
      throw new Error("One or more products are no longer available");
    }

    logStep("Products validated from database", { productCount: dbProducts.length });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check for existing customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Create line items for Stripe using DATABASE prices (not client-provided)
    const lineItems = dbProducts.map((product) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          images: product.images && product.images.length > 0 ? [product.images[0]] : [],
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: quantityMap[product.id],
    }));

    // Calculate totals using DATABASE prices
    const subtotal = dbProducts.reduce((sum, product) => {
      return sum + (product.price * quantityMap[product.id]);
    }, 0);
    
    const shippingCost = subtotal > 100 ? 0 : 9.99;
    const taxRate = 0.08;
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + shippingCost + taxAmount;

    logStep("Totals calculated from DB prices", { subtotal, shippingCost, taxAmount, totalAmount });

    // Generate order number
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNumber = `ORD-${dateStr}-${random}`;

    // Create order in database with pending status
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert([{
        user_id: user.id,
        order_number: orderNumber,
        subtotal,
        shipping_cost: shippingCost,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        payment_method: 'stripe',
        payment_status: 'pending',
        status: 'pending',
        shipping_address,
      }])
      .select()
      .single();

    if (orderError) {
      logStep("Order creation error", { error: orderError.message });
      throw new Error(`Failed to create order: ${orderError.message}`);
    }
    logStep("Order created", { orderId: order.id });

    // Add order items using DATABASE product data
    const orderItems = dbProducts.map((product) => ({
      order_id: order.id,
      product_id: product.id,
      product_name: product.name,
      product_image: product.images && product.images.length > 0 ? product.images[0] : null,
      quantity: quantityMap[product.id],
      unit_price: product.price,
      total_price: product.price * quantityMap[product.id],
    }));

    const { error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      logStep("Order items error", { error: itemsError.message });
    }

    const origin = req.headers.get("origin") || "http://localhost:5173";

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${origin}/cancel`,
      metadata: {
        order_id: order.id,
        order_number: orderNumber,
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: Math.round(shippingCost * 100),
              currency: 'usd',
            },
            display_name: shippingCost === 0 ? 'Free Shipping' : 'Standard Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
      ],
    });

    logStep("Checkout session created", { sessionId: session.id });

    // Update order with payment intent
    if (session.payment_intent) {
      await supabaseClient
        .from('orders')
        .update({ payment_intent_id: session.payment_intent as string })
        .eq('id', order.id);
    }

    return new Response(JSON.stringify({ url: session.url, orderId: order.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
