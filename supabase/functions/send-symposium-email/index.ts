// Edge Function: send-symposium-email
// Deploy to Supabase Edge Functions
// Requires RESEND_API_KEY secret set in Supabase Dashboard

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

/* ═══════ Email "from" addresses ═══════ */
const FROM_ADDRESSES: Record<string, string> = {
  registration: "AI Symposium <symposium@myirtiqa.com>",
  ambassador: "Campus Ambassadors <ambassador@myirtiqa.com>",
  pitch: "AI Competitions <competitions@myirtiqa.com>",
  poster: "AI Competitions <competitions@myirtiqa.com>",
  quiz: "AI Competitions <competitions@myirtiqa.com>",
  drill: "AI Competitions <competitions@myirtiqa.com>",
  debate: "AI Competitions <competitions@myirtiqa.com>",
  meme: "AI Competitions <competitions@myirtiqa.com>",
  default: "AI Symposium <info@myirtiqa.com>",
};

/* ═══════ Status email colors ═══════ */
const statusColors = {
  approved: { bg: "#059669", text: "Approved" },
  rejected: { bg: "#dc2626", text: "Not Selected" },
};

/* ═══════ Confirmation email HTML ═══════ */
function buildConfirmationHtml(
  name: string,
  type: string,
  extras: { whatsappLink?: string } = {}
): string {
  const whatsappBlock = extras.whatsappLink
    ? `
      <div style="margin-top:24px;text-align:center;">
        <a href="${extras.whatsappLink}" target="_blank" style="display:inline-block;background:#25D366;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:50px;text-transform:uppercase;letter-spacing:1px;">
          📱 Join WhatsApp Group
        </a>
        <p style="color:rgba(255,255,255,0.2);font-size:11px;margin-top:10px;">Stay updated on the selection process</p>
      </div>`
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:40px;">
      <div style="display:inline-block;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2);border-radius:50px;padding:8px 24px;margin-bottom:20px;">
        <span style="color:#3b82f6;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:3px;">GSRH × IRTIQA</span>
      </div>
      <h1 style="color:#ffffff;font-size:28px;font-weight:900;margin:0;text-transform:uppercase;letter-spacing:2px;">AI SYMPOSIUM 2026</h1>
      <p style="color:rgba(255,255,255,0.3);font-size:13px;margin-top:8px;">April 2026 • Northwest School of Medicine</p>
    </div>
    <div style="background:#111111;border:1px solid #222222;border-radius:20px;padding:40px;text-align:center;">
      <div style="width:60px;height:60px;border-radius:50%;background:rgba(34,197,94,0.1);margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">✓</span>
      </div>
      <h2 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 8px;">
        ${type === "ambassador" ? "Application Received!" : "Registration Confirmed!"}
      </h2>
      <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0 0 24px;line-height:1.6;">
        Dear <strong style="color:#ffffff;">${name}</strong>,
      </p>
      <p style="color:rgba(255,255,255,0.4);font-size:14px;line-height:1.8;margin:0;">
        Your <strong style="color:rgba(255,255,255,0.7);">${type === "registration" ? "Symposium Registration" : type === "ambassador" ? "Campus Ambassador Application" : type.charAt(0).toUpperCase() + type.slice(1) + " Competition Registration"}</strong> has been received successfully.
        Our team will review your submission and get back to you shortly.
      </p>
      ${whatsappBlock}
      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #222;">
        <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0 0 16px;">Event Details</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <div style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.15);border-radius:10px;padding:12px 20px;flex:1;min-width:120px;">
            <span style="color:#3b82f6;font-size:11px;font-weight:600;display:block;">📅 Date</span>
            <span style="color:rgba(255,255,255,0.6);font-size:12px;">Apr 10-11, 2026</span>
          </div>
          <div style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.15);border-radius:10px;padding:12px 20px;flex:1;min-width:120px;">
            <span style="color:#3b82f6;font-size:11px;font-weight:600;display:block;">📍 Venue</span>
            <span style="color:rgba(255,255,255,0.6);font-size:12px;">NWSM, Peshawar</span>
          </div>
        </div>
      </div>
    </div>
    <div style="text-align:center;margin-top:32px;">
      <p style="color:rgba(255,255,255,0.15);font-size:11px;margin:0;">© 2026 AI Symposium • GSRH × IRTIQA • Northwest School of Medicine</p>
      <p style="color:rgba(255,255,255,0.1);font-size:10px;margin-top:8px;">This is an automated email. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>`;
}

/* ═══════ Status update email HTML (existing) ═══════ */
function buildStatusHtml(name: string, status: string, type: string, notes: string): string {
  const s = statusColors[status as keyof typeof statusColors] || statusColors.approved;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:40px;">
      <div style="display:inline-block;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2);border-radius:50px;padding:8px 24px;margin-bottom:20px;">
        <span style="color:#3b82f6;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:3px;">GSRH × IRTIQA</span>
      </div>
      <h1 style="color:#ffffff;font-size:32px;font-weight:900;margin:0;text-transform:uppercase;letter-spacing:2px;">AI SYMPOSIUM</h1>
      <p style="color:rgba(255,255,255,0.3);font-size:13px;margin-top:8px;">April 2026 • Northwest School of Medicine</p>
    </div>
    <div style="background:#111111;border:1px solid #222222;border-radius:20px;padding:40px;text-align:center;">
      <div style="width:60px;height:60px;border-radius:50%;background:${s.bg}20;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:28px;">${status === "approved" ? "✓" : "✗"}</span>
      </div>
      <h2 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 8px;">
        ${status === "approved" ? "Congratulations!" : "Application Update"}
      </h2>
      <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0 0 24px;line-height:1.6;">
        Dear <strong style="color:#ffffff;">${name}</strong>,
      </p>
      <div style="display:inline-block;background:${s.bg}15;border:1px solid ${s.bg}30;border-radius:12px;padding:12px 28px;margin-bottom:24px;">
        <span style="color:${s.bg};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;">
          ${s.text}
        </span>
      </div>
      <p style="color:rgba(255,255,255,0.4);font-size:14px;line-height:1.8;margin:0;">
        Your <strong style="color:rgba(255,255,255,0.7);">${type}</strong> ${status === "approved"
      ? "has been reviewed and approved. We look forward to seeing you at the AI Symposium!"
      : "has been reviewed. Unfortunately, we were unable to accept your application at this time."}
      </p>
      ${notes ? `
      <div style="margin-top:24px;padding:16px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid #222;">
        <p style="color:rgba(255,255,255,0.3);font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;font-weight:700;">Note from organizers</p>
        <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0;line-height:1.6;">${notes}</p>
      </div>` : ""}
      ${status === "approved" ? `
      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #222;">
        <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0 0 16px;">What's next?</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <div style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.15);border-radius:10px;padding:12px 20px;flex:1;min-width:120px;">
            <span style="color:#3b82f6;font-size:11px;font-weight:600;display:block;">📅 Date</span>
            <span style="color:rgba(255,255,255,0.6);font-size:12px;">Apr 10-11, 2026</span>
          </div>
          <div style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.15);border-radius:10px;padding:12px 20px;flex:1;min-width:120px;">
            <span style="color:#3b82f6;font-size:11px;font-weight:600;display:block;">📍 Venue</span>
            <span style="color:rgba(255,255,255,0.6);font-size:12px;">NWSM, Peshawar</span>
          </div>
        </div>
      </div>` : ""}
    </div>
    <div style="text-align:center;margin-top:32px;">
      <p style="color:rgba(255,255,255,0.15);font-size:11px;margin:0;">© 2026 AI Symposium • GSRH × IRTIQA • Northwest School of Medicine</p>
      <p style="color:rgba(255,255,255,0.1);font-size:10px;margin-top:8px;">This is an automated email. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>`;
}

/* ═══════ Subject lines ═══════ */
function getConfirmationSubject(type: string, code?: string): string {
  switch (type) {
    case "registration": return `Registration Confirmed — AI Symposium 2026${code ? ` (Code: ${code})` : ""}`;
    case "ambassador": return "Application Received — Campus Ambassador Program";
    case "pitch": return "Submission Received — AI Pitch Competition";
    case "poster": return "Submission Received — AI Poster Competition";
    case "quiz": return "Submission Received — AI Quiz Competition";
    case "drill": return "Submission Received — AI Drill Competition";
    case "debate": return "Submission Received — AI Debate Competition";
    case "meme": return "Submission Received — AI Meme Competition";
    default: return "Submission Received — AI Symposium 2026";
  }
}

/* ═══════ Main handler ═══════ */
Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    const body = await req.json();
    const { mode = "status_update", to, name, status, type, notes, registrationCode, whatsappLink } = body;

    if (!RESEND_API_KEY) {
      console.log(`[EMAIL] Would send ${mode} email to ${to} for ${type}`);
      return new Response(
        JSON.stringify({ success: true, message: "Email logged (no RESEND_API_KEY)" }),
        { headers: corsHeaders }
      );
    }

    let html: string;
    let subject: string;
    let fromAddr: string;

    if (mode === "confirmation") {
      html = buildConfirmationHtml(name, type, { registrationCode, whatsappLink });
      subject = getConfirmationSubject(type, registrationCode);
      fromAddr = FROM_ADDRESSES[type] || FROM_ADDRESSES.default;
    } else {
      html = buildStatusHtml(name, status, type, notes || "");
      subject = status === "approved"
        ? `✓ Your ${type} has been approved — AI Symposium 2026`
        : `Update on your ${type} — AI Symposium 2026`;
      fromAddr = FROM_ADDRESSES[type] || FROM_ADDRESSES.default;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: fromAddr,
        to: [to],
        subject,
        html,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify({ success: true, ...data }), { headers: corsHeaders });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
