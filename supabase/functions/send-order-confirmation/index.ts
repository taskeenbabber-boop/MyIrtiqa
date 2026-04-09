import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  orderId: string;
  userEmail: string;
  userName: string;
  productTitle: string;
  amount: number;
  currency: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, userEmail, userName, productTitle, amount, currency }: OrderConfirmationRequest = await req.json();

    // Initialize Resend (you'll need to add RESEND_API_KEY secret)
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #1a1a1a;
              background: #f5f5f5;
              padding: 20px;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
            }
            .header { 
              background: linear-gradient(135deg, #0052FF 0%, #4080FF 100%);
              color: white; 
              padding: 48px 32px;
              text-align: center;
            }
            .header h1 {
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 8px;
              letter-spacing: -0.5px;
            }
            .header p {
              font-size: 16px;
              opacity: 0.95;
            }
            .content { 
              padding: 40px 32px;
            }
            .greeting {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 16px;
              color: #1a1a1a;
            }
            .message {
              font-size: 15px;
              color: #4a5568;
              margin-bottom: 32px;
              line-height: 1.7;
            }
            .order-details { 
              background: linear-gradient(to bottom, #f8fafc, #ffffff);
              padding: 24px;
              border-radius: 12px;
              margin: 32px 0;
              border: 1px solid #e2e8f0;
            }
            .order-details h2 {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 20px;
              color: #1a1a1a;
            }
            .order-row { 
              display: flex; 
              justify-content: space-between; 
              padding: 14px 0;
              border-bottom: 1px solid #e2e8f0;
              font-size: 15px;
            }
            .order-row:last-child { border-bottom: none; }
            .order-row strong { 
              color: #4a5568;
              font-weight: 500;
            }
            .order-row span:last-child {
              color: #1a1a1a;
              font-weight: 600;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 16px;
              background: #fef3c7;
              color: #92400e;
              border-radius: 20px;
              font-size: 13px;
              font-weight: 600;
            }
            .next-steps {
              margin: 32px 0;
            }
            .next-steps h3 {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 16px;
              color: #1a1a1a;
            }
            .next-steps ul {
              list-style: none;
              padding: 0;
            }
            .next-steps li {
              padding: 12px 0 12px 32px;
              position: relative;
              color: #4a5568;
              font-size: 15px;
              line-height: 1.6;
            }
            .next-steps li:before {
              content: "✓";
              position: absolute;
              left: 0;
              color: #0052FF;
              font-weight: bold;
              font-size: 18px;
            }
            .button-container {
              text-align: center;
              margin: 40px 0;
            }
            .button { 
              display: inline-block;
              background: linear-gradient(135deg, #0052FF 0%, #4080FF 100%);
              color: white;
              padding: 16px 40px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 15px;
              box-shadow: 0 4px 12px rgba(0, 82, 255, 0.3);
              transition: transform 0.2s;
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(0, 82, 255, 0.4);
            }
            .footer { 
              text-align: center;
              padding: 32px;
              background: #f8fafc;
              border-top: 1px solid #e2e8f0;
            }
            .footer p {
              color: #64748b;
              font-size: 13px;
              line-height: 1.6;
              margin: 4px 0;
            }
            .footer a {
              color: #0052FF;
              text-decoration: none;
            }
            .divider {
              height: 1px;
              background: linear-gradient(to right, transparent, #e2e8f0, transparent);
              margin: 24px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Order Confirmed</h1>
              <p>Thank you for choosing IRTIQA</p>
            </div>
            <div class="content">
              <p class="greeting">Dear ${userName},</p>
              <p class="message">
                We've successfully received your order and payment proof. Our team is now reviewing your payment 
                and will verify it within the next 24 hours. You'll receive another email as soon as your order is approved.
              </p>
              
              <div class="order-details">
                <h2>📋 Order Summary</h2>
                <div class="order-row">
                  <strong>Order ID</strong>
                  <span>${orderId.substring(0, 8).toUpperCase()}</span>
                </div>
                <div class="order-row">
                  <strong>Program</strong>
                  <span>${productTitle}</span>
                </div>
                <div class="order-row">
                  <strong>Amount</strong>
                  <span>${currency} ${amount.toLocaleString()}</span>
                </div>
                <div class="order-row">
                  <strong>Status</strong>
                  <span class="status-badge">⏳ Pending Review</span>
                </div>
              </div>

              <div class="next-steps">
                <h3>📍 What Happens Next?</h3>
                <ul>
                  <li>Our admin team will verify your payment within 24 hours</li>
                  <li>You'll receive a confirmation email once approved</li>
                  <li>Instant access to all program materials after approval</li>
                  <li>Track your order status anytime from your dashboard</li>
                </ul>
              </div>

              <div class="divider"></div>
              
              <div class="button-container">
                <a href="https://myirtiqa.com/library" class="button">View My Library →</a>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Need Help?</strong></p>
              <p>Contact us at <a href="mailto:support@myirtiqa.com">support@myirtiqa.com</a></p>
              <p style="margin-top: 16px;">© ${new Date().getFullYear()} IRTIQA. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "IRTIQA <orders@myirtiqa.com>",
        to: [userEmail],
        subject: `Order Confirmation - ${productTitle}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      throw new Error(`Failed to send email: ${error}`);
    }

    const result = await emailResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(
      JSON.stringify({ success: true, emailId: result.id }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
