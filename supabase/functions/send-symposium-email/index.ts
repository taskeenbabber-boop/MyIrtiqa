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

/* ═══════ Shared HTML Components ═══════ */
const EMAIL_STYLES = `
  body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .wrapper { padding: 40px 20px; }
  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .header { padding: 40px 20px 30px; text-align: center; }
  .brand { display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; color: #111827; letter-spacing: 1px; }
  .brand-dot { width: 14px; height: 14px; background-color: #2563eb; border-radius: 50%; display: inline-block; vertical-align: middle; margin-right: 10px; }
  .icon-wrapper { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 30px auto 20px; border: 2px solid; }
  .icon { font-size: 32px; line-height: 1; }
  .title { font-size: 32px; font-weight: 800; color: #111827; margin: 0 0 12px; }
  .subtitle { font-size: 16px; color: #4b5563; margin: 0 0 20px; line-height: 1.5; }
  .code { font-size: 14px; color: #6b7280; margin: 0 0 30px; letter-spacing: 1px; font-weight: 600; }
  .huge-code { font-size: 28px; font-family: monospace; font-weight: 900; color: #111827; letter-spacing: 4px; margin: 15px 0; padding: 15px; background: #f9fafb; border: 2px dashed #e5e7eb; border-radius: 8px; display: inline-block; }
  .btn { display: inline-block; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 50px; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
  
  .details-section { padding: 35px 30px; border-top: 1px solid #f3f4f6; }
  @media (min-width: 500px) { .details-section { padding: 35px 40px; } }
  .section-title { font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 25px; text-transform: uppercase; letter-spacing: 1px; }
  
  .highlight-item { display: flex; align-items: flex-start; margin-bottom: 24px; }
  .hl-icon { width: 48px; height: 48px; border-radius: 8px; background-color: #eff6ff; font-size: 24px; text-align: center; line-height: 48px; flex-shrink: 0; margin-right: 16px; }
  .hl-content { flex-grow: 1; text-align: left; }
  .hl-title { font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 6px; }
  .hl-desc { font-size: 14px; color: #6b7280; margin: 0 0 8px; line-height: 1.5; }
  .hl-badge { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 4px 12px; border-radius: 50px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
  
  .promo-box { margin: 0 20px 40px; text-align: center; padding: 30px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
  @media (min-width: 500px) { .promo-box { margin: 0 40px 40px; } }
  .stars { color: #cbd5e1; font-size: 24px; margin-bottom: 15px; letter-spacing: 4px; }
  .promo-text { font-size: 14px; color: #4b5563; margin: 0 0 25px; line-height: 1.6; }
  
  .footer { background-color: #2563eb; color: #ffffff; padding: 40px 20px; text-align: center; }
  .footer-links { font-size: 13px; color: rgba(255,255,255,0.9); margin-bottom: 20px; }
  .footer-links a { color: #ffffff; text-decoration: none; margin: 0 12px; font-weight: 600; }
  .footer-copy { font-size: 12px; color: rgba(255,255,255,0.7); margin: 0; line-height: 1.6; }
`;

function getHighlightsHtml() {
  return `
    <div class="details-section">
      <h3 class="section-title">Event Highlights</h3>
      
      <div class="highlight-item">
        <div class="hl-icon">📅</div>
        <div class="hl-content">
          <h4 class="hl-title">Two Days of Innovation</h4>
          <p class="hl-desc">Join us on April 10-11, 2026 at NWSM, Peshawar for an unforgettable exploration spanning AI, Neurosurgery, and Clinical Diagnostics.</p>
          <span class="hl-badge">Save The Date</span>
        </div>
      </div>
      
      <div class="highlight-item">
        <div class="hl-icon">🛠️</div>
        <div class="hl-content">
          <h4 class="hl-title">6+ Hands-on Workshops</h4>
          <p class="hl-desc">Master Prompt Engineering, AI in Research, Surgical Robotics, and Clinical Decision Support Systems in immersive sessions.</p>
          <span class="hl-badge" style="background-color: #8b5cf6;">Practical Learning</span>
        </div>
      </div>
      
      <div class="highlight-item">
        <div class="hl-icon">🏆</div>
        <div class="hl-content">
          <h4 class="hl-title">4 Major Competitions</h4>
          <p class="hl-desc">Showcase your brilliance in the AI Pitch Competition, Poster Presentations, Clinical Quiz, and the legendary Debate Championship.</p>
          <span class="hl-badge" style="background-color: #f59e0b;">Win Big</span>
        </div>
      </div>
      
      <div class="highlight-item" style="margin-bottom: 0;">
        <div class="hl-icon" style="background-color: #fdf2f8;">🕹️</div>
        <div class="hl-content">
          <h4 class="hl-title">Unmatched Entertainment</h4>
          <p class="hl-desc">Relax and network in our massive E-Gaming zone. Try VR surgical simulators, archery, and end the symposium with an exclusive Gala Dinner.</p>
          <span class="hl-badge" style="background-color: #ec4899;">Fun & Social</span>
        </div>
      </div>
    </div>
  `;
}

function getPromoFooterHtml() {
  return `
      <div class="promo-box">
        <div class="stars">★★★★★</div>
        <h3 style="margin: 0 0 10px; color: #111827; font-size: 18px;">Share The Innovation! 🚀</h3>
        <p class="promo-text">
          Help us make this the biggest medical AI event in Pakistan!<br>
          We would be absolutely thrilled if you shared the AI Symposium 2026 with your friends, colleagues, and network. Let's build the future of healthcare together.
        </p>
        <a href="https://myirtiqa.com/ai-symposium" class="btn" style="background-color: #111827; padding: 12px 24px;">View Event Website</a>
      </div>
    </div>
    <div class="details-section" style="text-align: center; border-top: none; padding-top: 10px; padding-bottom: 30px;">
      <div class="brand"><span class="brand-dot"></span>IRTIQA x GSRH</div>
    </div>
    <div class="footer">
      <div class="footer-links">
        <a href="https://myirtiqa.com">Home</a> • 
        <a href="https://myirtiqa.com/ai-symposium">Symposium</a> • 
        <a href="mailto:info@myirtiqa.com">Contact Support</a>
      </div>
      <p class="footer-copy">© 2026 AI Symposium & MyIrtiqa.<br>Northwest School of Medicine, Peshawar.<br>All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/* ═══════ Confirmation email HTML ═══════ */
function buildConfirmationHtml(name: string, type: string, extras: { whatsappLink?: string } = {}): string {
  const whatsappHtml = extras.whatsappLink
    ? `<div style="margin-top: 25px;"><a href="${extras.whatsappLink}" class="btn" style="background-color: #25d366;"><span style="font-size:16px;margin-right:8px;">📱</span> Join WhatsApp Group</a></div>`
    : "";

  const titleText = type === "ambassador" ? "Application Received!" : "Registration Received!";
  const subText = `Dear <strong>${name}</strong>,<br>Your ${type === "registration" ? "Symposium Registration" : type === "ambassador" ? "Campus Ambassador Application" : type.charAt(0).toUpperCase() + type.slice(1) + " Registration"} has been submitted successfully and is pending review by our team.`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${EMAIL_STYLES}
    .icon-wrapper-confirm { background-color: #eff6ff; border-color: #2563eb; }
    .icon-confirm { color: #2563eb; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="brand"><span class="brand-dot"></span>IRTIQA x GSRH</div>
        <div class="icon-wrapper icon-wrapper-confirm">
          <div class="icon icon-confirm">✓</div>
        </div>
        <h1 class="title">Thank You!</h1>
        <p class="subtitle">${subText}</p>
        <p class="code" style="color:#2563eb;">ORDER STATUS: PENDING REVIEW</p>
        <a href="https://myirtiqa.com/ai-symposium" class="btn" style="background-color: #2563eb;">Explore Event Details</a>
        ${whatsappHtml}
      </div>
      
      ${getHighlightsHtml()}
      ${getPromoFooterHtml()}
  `;
}

/* ═══════ Status update email HTML ═══════ */
function buildStatusHtml(name: string, status: string, type: string, notes: string, registrationCode?: string): string {
  const isApproved = status === "approved";
  const titleText = isApproved ? "Congratulations!" : "Application Update";
  const subText = `Dear <strong>${name}</strong>,<br>Your ${type} ${isApproved ? "has been reviewed and <strong>approved</strong>. We are absolutely thrilled to welcome you to the AI Symposium!" : "has been carefully reviewed. Unfortunately, we were unable to select your application at this time."}`;

  const iconColor = isApproved ? "#059669" : "#dc2626";
  const iconBg = isApproved ? "#ecfdf5" : "#fef2f2";
  const iconChar = isApproved ? "🎟️" : "ℹ️";

  const codeBlock = (isApproved && registrationCode)
    ? `<div><p class="code" style="margin-bottom:0;">ORDER NO / REGISTRATION CODE</p><div class="huge-code">${registrationCode}</div><p style="font-size:12px;color:#6b7280;margin:0 0 30px;">Please present this code at the registration desk.</p></div>`
    : `<p class="code" style="color:${iconColor};">STATUS: ${status.toUpperCase()}</p>`;

  const notesHtml = notes
    ? `<div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 0 auto 30px; text-align: left; font-size: 14px; border: 1px solid #e2e8f0; color: #4b5563;"><strong style="color:#111827;">Note from organizers:</strong><br><div style="margin-top:8px;line-height:1.5;">${notes}</div></div>`
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${EMAIL_STYLES}
    .icon-status { color: ${iconColor}; }
    .icon-wrapper-status { background-color: ${iconBg}; border-color: ${iconColor}; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="brand"><span class="brand-dot"></span>IRTIQA x GSRH</div>
        <div class="icon-wrapper icon-wrapper-status">
          <div class="icon icon-status">${iconChar}</div>
        </div>
        <h1 class="title">${titleText}</h1>
        <p class="subtitle" style="margin-bottom: ${notes ? '20px' : '30px'};">${subText}</p>
        ${notesHtml}
        ${codeBlock}
        ${isApproved ? `<a href="https://myirtiqa.com/ai-symposium" class="btn" style="background-color: ${iconColor}">View Event Dashboard</a>` : ""}
      </div>
      
      ${isApproved ? getHighlightsHtml() : ""}
      ${getPromoFooterHtml()}
  `;
}

/* ═══════ Subject lines ═══════ */
function getConfirmationSubject(type: string, code?: string): string {
  switch (type) {
    case "registration": return `Registration Confirmed — AI Symposium 2026${code ? ` (Code: ${code})` : ""} `;
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
      html = buildConfirmationHtml(name, type, { whatsappLink });
      subject = getConfirmationSubject(type);
      fromAddr = FROM_ADDRESSES[type] || FROM_ADDRESSES.default;
    } else {
      html = buildStatusHtml(name, status, type, notes || "", registrationCode);
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

    if (!res.ok) {
      console.error("[EMAIL ERROR] Resend API failed:", data);
    } else {
      console.log(`[EMAIL SUCCESS] Sent to ${to}`);
    }

    return new Response(JSON.stringify({ success: res.ok, ...data }), { headers: corsHeaders });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
