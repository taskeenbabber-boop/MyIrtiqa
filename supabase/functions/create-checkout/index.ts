import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CheckoutRequest {
  productId: string;
  paymentProofUrl?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { productId, paymentProofUrl }: CheckoutRequest = await req.json();

    console.log("Creating bank transfer order for user:", user.id, "product:", productId);

    // Fetch product details - support both slug and UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
    
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq(isUUID ? "id" : "slug", productId)
      .single();

    if (productError || !product) {
      throw new Error("Product not found");
    }

    // Create order record with bank transfer details and user info
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        product_id: product.id,
        amount: product.price,
        currency: product.currency,
        status: "pending",
        provider: "bank_transfer",
        payment_proof_url: paymentProofUrl,
        user_email: user.email,
        user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error("Failed to create order");
    }

    console.log("Bank transfer order created:", order.id);

    // Send order confirmation email
    try {
      if (user?.email) {
        await supabase.functions.invoke("send-order-confirmation", {
          body: {
            orderId: order.id,
            userEmail: user.email,
            userName: user.user_metadata?.full_name || user.email.split('@')[0],
            productTitle: product.title,
            amount: product.price,
            currency: product.currency,
          },
        });
        console.log("Confirmation email sent to:", user.email);
      }
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the order creation if email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        orderId: order.id,
        message: "Order submitted successfully. Awaiting admin verification."
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in create-checkout:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
