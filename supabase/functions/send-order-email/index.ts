import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-ORDER-EMAIL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) throw new Error("RESEND_API_KEY is not set");
    
    const resend = new Resend(resendApiKey);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify the authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized: Invalid token");
    }
    logStep("User authenticated", { userId: user.id });

    const { orderId, type } = await req.json();
    logStep("Request parsed", { orderId, type });

    // Fetch order with user profile
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('*, profiles:user_id(email, full_name)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderError?.message}`);
    }
    logStep("Order fetched", { orderNumber: order.order_number });

    // Authorization check: verify the user owns the order or is an admin
    const { data: isAdmin } = await supabaseClient.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (order.user_id !== user.id && !isAdmin) {
      logStep("Authorization failed", { orderUserId: order.user_id, requestUserId: user.id });
      throw new Error("Unauthorized: You don't have permission to access this order");
    }
    logStep("Authorization verified");

    // Fetch order items
    const { data: items } = await supabaseClient
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    const email = order.profiles?.email;
    if (!email) {
      throw new Error("User email not found");
    }

    let subject = '';
    let html = '';

    const itemsHtml = items?.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <img src="${item.product_image || 'https://via.placeholder.com/60'}" alt="${item.product_name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" />
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <p style="margin: 0; font-weight: 600;">${item.product_name}</p>
          <p style="margin: 4px 0 0; color: #666; font-size: 14px;">Qty: ${item.quantity}</p>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">
          $${Number(item.total_price).toFixed(2)}
        </td>
      </tr>
    `).join('') || '';

    if (type === 'confirmation') {
      subject = `Order Confirmed - ${order.order_number}`;
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Order Confirmed! 🎉</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">Thank you for your purchase</p>
            </div>
            
            <div style="padding: 32px;">
              <p style="color: #333; font-size: 16px; margin: 0 0 24px;">
                Hi ${order.profiles?.full_name || 'there'},<br><br>
                We've received your order and it's being processed. Here's a summary of your purchase:
              </p>
              
              <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0; color: #666; font-size: 14px;">Order Number</p>
                <p style="margin: 4px 0 0; font-size: 18px; font-weight: 700; color: #3b82f6;">${order.order_number}</p>
              </div>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <thead>
                  <tr>
                    <th style="text-align: left; padding: 12px; border-bottom: 2px solid #eee; color: #666; font-size: 14px;">Product</th>
                    <th style="text-align: left; padding: 12px; border-bottom: 2px solid #eee; color: #666; font-size: 14px;">Details</th>
                    <th style="text-align: right; padding: 12px; border-bottom: 2px solid #eee; color: #666; font-size: 14px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <div style="border-top: 2px solid #eee; padding-top: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #666;">Subtotal</span>
                  <span>$${Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #666;">Shipping</span>
                  <span>${Number(order.shipping_cost) === 0 ? 'FREE' : '$' + Number(order.shipping_cost).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #666;">Tax</span>
                  <span>$${Number(order.tax_amount).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; margin-top: 12px; padding-top: 12px; border-top: 2px solid #eee;">
                  <span>Total</span>
                  <span style="color: #3b82f6;">$${Number(order.total_amount).toFixed(2)}</span>
                </div>
              </div>
              
              <div style="margin-top: 32px; text-align: center;">
                <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.dev')}/orders/${order.id}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
                  Track Your Order
                </a>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 24px; text-align: center; color: #666; font-size: 14px;">
              <p style="margin: 0 0 8px;">Questions? Contact us at support@techstore.com</p>
              <p style="margin: 0;">Thank you for shopping with us!</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (type === 'shipped') {
      subject = `Your Order Has Shipped - ${order.order_number}`;
      html = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0;">Your Order is On Its Way! 📦</h1>
            </div>
            <div style="padding: 32px;">
              <p>Hi ${order.profiles?.full_name || 'there'},</p>
              <p>Great news! Your order <strong>${order.order_number}</strong> has been shipped.</p>
              ${order.tracking_number ? `<p>Tracking Number: <strong>${order.tracking_number}</strong></p>` : ''}
              <p>You can track your order using the button below.</p>
              <div style="text-align: center; margin-top: 24px;">
                <a href="#" style="display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">
                  Track Shipment
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "TechStore <onboarding@resend.dev>",
      to: [email],
      subject,
      html,
    });

    logStep("Email sent", { emailId: emailResponse.data?.id });

    return new Response(JSON.stringify({ success: true }), {
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
