import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // CRITICAL SECURITY: Payment webhook is disabled until proper signature verification is implemented
    // This prevents attackers from forging payment confirmations
    console.error("Payment webhook called but is DISABLED for security - no signature verification implemented");
    
    return new Response(
      JSON.stringify({ 
        error: "Payment webhook is temporarily disabled for security reasons. Signature verification must be implemented before enabling.",
        details: "Contact administrator to enable proper webhook verification with JAZZCASH_INTEGRITY_SALT, EASYPAISA_HASH_KEY, and PAYFAST_MERCHANT_KEY"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 503, // Service Unavailable
      }
    );

    /* FIXME: Implement proper webhook signature verification before enabling this code
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const provider = url.searchParams.get("provider");
    const orderId = url.searchParams.get("orderId");

    console.log("Webhook received - provider:", provider, "orderId:", orderId);

    if (!provider || !orderId) {
      throw new Error("Missing provider or orderId");
    }

    // Verify webhook signature based on provider
    let isValid = false;
    
    switch (provider) {
      case "jazzcash":
        isValid = await verifyJazzCashWebhook(req);
        break;
      case "easypaisa":
        isValid = await verifyEasypaisaWebhook(req);
        break;
      case "payfast":
        isValid = await verifyPayFastWebhook(req);
        break;
      default:
        throw new Error("Invalid provider");
    }

    if (!isValid) {
      console.error("Invalid webhook signature for provider:", provider, "orderId:", orderId);
      throw new Error("Invalid webhook signature");
    }

    // Get order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, products(*)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    // Update order status to paid
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", orderId);

    if (updateError) {
      throw new Error("Failed to update order");
    }

    console.log("Order marked as paid:", orderId);

    // Check if user already has member role
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", order.user_id)
      .eq("role", "member")
      .single();

    // Grant member role if this is first purchase
    if (!existingRole) {
      await supabase
        .from("user_roles")
        .insert({
          user_id: order.user_id,
          role: "member",
        });
      
      console.log("Member role granted to user:", order.user_id);
    }

    // TODO: Send receipt email via Resend (implement later)
    console.log("Payment successful for order:", orderId);

    return new Response(
      JSON.stringify({ success: true, message: "Payment processed" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
    */

  } catch (error: any) {
    console.error("Error in payment-webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

/* FIXME: Implement these verification functions with proper HMAC signature checking
   
async function verifyJazzCashWebhook(req: Request): Promise<boolean> {
  const integrityKey = Deno.env.get('JAZZCASH_INTEGRITY_SALT');
  if (!integrityKey) {
    console.error("JAZZCASH_INTEGRITY_SALT not configured");
    return false;
  }
  
  const body = await req.clone().text();
  const receivedHash = req.headers.get('pp_SecureHash');
  
  if (!receivedHash) {
    console.error("Missing pp_SecureHash header");
    return false;
  }
  
  // Compute HMAC-SHA256 hash
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(integrityKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(body)
  );
  
  const computedHash = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const isValid = computedHash === receivedHash.toLowerCase();
  console.log("JazzCash webhook verification:", isValid ? "VALID" : "INVALID");
  return isValid;
}

async function verifyEasypaisaWebhook(req: Request): Promise<boolean> {
  const hashKey = Deno.env.get('EASYPAISA_HASH_KEY');
  if (!hashKey) {
    console.error("EASYPAISA_HASH_KEY not configured");
    return false;
  }
  
  // Implement Easypaisa-specific HMAC verification
  // Similar to JazzCash but with their specific format
  console.log("Verifying Easypaisa webhook");
  return false; // TODO: Implement
}

async function verifyPayFastWebhook(req: Request): Promise<boolean> {
  const merchantKey = Deno.env.get('PAYFAST_MERCHANT_KEY');
  if (!merchantKey) {
    console.error("PAYFAST_MERCHANT_KEY not configured");
    return false;
  }
  
  // Implement PayFast-specific verification
  console.log("Verifying PayFast webhook");
  return false; // TODO: Implement
}
*/
