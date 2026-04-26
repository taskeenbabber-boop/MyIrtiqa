// Edge Function: send-symposium-email
// Deploy to Supabase Edge Functions
// Requires RESEND_API_KEY secret set in Supabase Dashboard

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

/* ═══════ Email "from" addresses ═══════ */
const FROM_ADDRESSES: Record<string, string> = {
  registration: "AI Symposium <symposium@myirtiqa.com>",
  registrations: "AI Symposium <symposium@myirtiqa.com>",
  ambassador: "Campus Ambassadors <ambassador@myirtiqa.com>",
  pitch: "AI Competitions <competitions@myirtiqa.com>",
  poster: "AI Competitions <competitions@myirtiqa.com>",
  quiz: "AI Competitions <competitions@myirtiqa.com>",
  drill: "AI Competitions <competitions@myirtiqa.com>",
  debate: "AI Competitions <competitions@myirtiqa.com>",
  meme: "AI Competitions <competitions@myirtiqa.com>",
  default: "AI Symposium <info@myirtiqa.com>",
};

/* ═══════ WhatsApp Group Links ═══════ */
const WHATSAPP_LINKS: Record<string, string> = {
  // Workshops (by workshop ID)
  "ws-4": "https://chat.whatsapp.com/BuCogfzRgsd6MiWxpkU87b?mode=gi_t",       // Clinical Audit
  "ws-6": "https://chat.whatsapp.com/CeGEbtIjlv3DsQSK5uWSNU?mode=gi_t",       // Prompt Engineering
  "ws-5a": "https://chat.whatsapp.com/DgCsGekcIWZ6MEsINEZDkX?mode=gi_t",      // Suturing (Morning)
  "ws-5b": "https://chat.whatsapp.com/DgCsGekcIWZ6MEsINEZDkX?mode=gi_t",      // Suturing (Afternoon)
  "ws-7": "https://chat.whatsapp.com/BjIll6ySxr4BXa3IB6H9fJ?mode=gi_t",       // Startup Workshop
  // Competitions (by type keyword)
  "pitch": "https://chat.whatsapp.com/CnrcPo0ZtK1I6GFfnwvYoK?mode=gi_t",
  "poster": "https://chat.whatsapp.com/J9E5tcUxl2HGIyAj3Owg13?mode=gi_t",
  "quiz": "https://chat.whatsapp.com/KvB7UfN1GayClP4DIPzOa3?mode=gi_t",
  "drill": "https://chat.whatsapp.com/HSrheh1Jx7nIBwI6jIPBP7?mode=gi_t",
  "debate": "https://chat.whatsapp.com/CrjPVMB0Fq0BhADLtRsDXw?mode=gi_t",
  "meme": "",
};

/* ═══════ Workshop name mapping ═══════ */
const WORKSHOP_NAMES: Record<string, string> = {
  "ws-4": "Clinical Audit & AI in Clinical Use",
  "ws-6": "Prompt Engineering: Talk to AI in Design",
  "ws-5a": "Suturing with a Plastic Surgeon (Morning)",
  "ws-5b": "Suturing with a Plastic Surgeon (Afternoon)",
  "ws-7": "How to Build and Scale a Startup",
};

/* ═══════ Competition display names ═══════ */
const COMPETITION_NAMES: Record<string, string> = {
  pitch: "AI Pitch Competition",
  poster: "AI Poster Competition",
  quiz: "AI Quiz Competition",
  drill: "AI Drill Competition",
  debate: "AI Debate Competition",
  meme: "AI Memes Competition",
};

/* ═══════ Shared HTML Components ═══════ */
const EMAIL_STYLES = `
  body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
  .wrapper { width: 100%; table-layout: fixed; background-color: #1a1a2e; padding-top: 20px; padding-bottom: 40px; }
  .container { max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
  .dark-header { background-color: #111827; padding: 0; text-align: center; }
  .dark-header img { width: 100%; height: auto; display: block; }
  .title-logo { font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: 2px; text-transform: uppercase; margin: 0; display: flex; align-items: center; justify-content: center; gap: 10px; }
  .title-logo span { color: #fdf2f8; font-weight: 300; }
  
  .content-body { padding: 40px; text-align: center; }
  .greeting { font-size: 16px; color: #111827; font-weight: 600; margin-bottom: 5px; }
  .main-heading { font-size: 26px; font-weight: 900; color: #111827; text-transform: uppercase; margin-top: 0; margin-bottom: 20px; }
  .main-heading span { color: #3b82f6; } 
  .intro-text { font-size: 14px; color: #4b5563; line-height: 1.6; margin-bottom: 25px; }
  
  .next-steps { background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 30px 0; border: 1px solid #e2e8f0; font-size: 13px; color: #4b5563; line-height: 1.5; text-align: left; }
  .next-steps strong { color: #111827; text-transform: uppercase; }

  .ticket-preview { background: linear-gradient(135deg, #fbcfe8 0%, #a78bfa 50%, #3b82f6 100%); border-radius: 12px; padding: 25px; display: inline-block; color: white; margin-bottom: 30px; position: relative; font-weight: 900; font-size: 20px; text-transform: uppercase; box-shadow: 0 4px 15px rgba(59,130,246,0.3); }
  
  /* Dark Agenda Section */
  .agenda-section { background-color: #1a1a2e; padding: 40px; color: #ffffff; text-align: left; }
  .agenda-header { font-size: 28px; font-weight: 900; line-height: 1.1; margin: 0 0 20px; text-transform: uppercase; }
  .agenda-header span { color: #60a5fa; }
  
  .pills { margin-bottom: 30px; }
  .pill { display: inline-block; padding: 6px 14px; border-radius: 50px; font-size: 10px; font-weight: 700; text-transform: uppercase; border: 1px solid rgba(255,255,255,0.2); margin-right: 8px; margin-bottom: 8px; color: rgba(255,255,255,0.7); }
  .pill.active { background-color: #3b82f6; border-color: #3b82f6; color: #ffffff; }

  .event-card { background-color: #111827; border-radius: 12px; padding: 20px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.05); display: table; width: 100%; box-sizing: border-box; }
  .card-left { display: table-cell; vertical-align: middle; width: 60px; padding-right: 15px; }
  .card-icon { width: 50px; height: 50px; background-color: #1f2937; border-radius: 10px; display: inline-block; text-align: center; line-height: 50px; font-size: 24px; }
  .card-middle { display: table-cell; vertical-align: middle; }
  .card-meta { font-size: 10px; color: #60a5fa; font-weight: 700; text-transform: uppercase; margin: 0 0 4px; }
  .card-meta span { color: rgba(255,255,255,0.3); font-weight: 400; }
  .card-title { font-size: 16px; font-weight: 700; color: #ffffff; margin: 0 0 4px; }
  .card-time { font-size: 11px; color: rgba(255,255,255,0.5); margin: 0; }
  
  .share-block { background: #fdf2f8; border-radius: 16px; padding: 30px; text-align: center; margin: 30px 40px 10px; }
  .share-title { font-size: 18px; font-weight: 900; color: #ec4899; text-transform: uppercase; margin: 0 0 10px; }
  .share-text { font-size: 13px; color: #4b5563; line-height: 1.5; margin: 0 0 20px; }
  
  .footer-venue { padding: 30px 40px; text-align: center; border-bottom: 5px solid #1a1a2e; }
  .venue-text { font-size: 15px; font-weight: 700; color: #111827; margin: 0 0 15px; }
  .footer-links { font-size: 12px; font-weight: 600; color: #4b5563; }
  .footer-links a { color: #4b5563; text-decoration: underline; margin: 0 10px; }
`;

function getAgendaHtml() {
  return `
    <div class="agenda-section">
      <div class="agenda-header">EVENT<br><span>AGENDA</span></div>
      
      <div style="margin-bottom:20px;">
        <div style="display:inline-block;padding:6px 16px;background:#3b82f6;border-radius:50px;font-size:11px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:1px;">DAY 1 — 7 MAY 2026</div>
      </div>

      <div class="event-card">
        <div class="card-left"><img src="https://myirtiqa.com/icons/Clinical-Audit.png" width="50" height="50" style="width: 50px; height: 50px; border-radius: 10px; display: block;" alt="icon" /></div>
        <div class="card-middle">
          <p class="card-meta">WORKSHOP <span>• 7 May 2026</span></p>
          <p class="card-title">Clinical Audit & AI in Clinical Use</p>
          <p class="card-time">🕒 10:00 AM – 12:00 PM &nbsp;&nbsp; 📍 Workshop Room 1 • Hybrid</p>
        </div>
      </div>
      
      <div class="event-card">
        <div class="card-left"><img src="https://myirtiqa.com/icons/Prompt-Engineering.png" width="50" height="50" style="width: 50px; height: 50px; border-radius: 10px; display: block;" alt="icon" /></div>
        <div class="card-middle">
          <p class="card-meta">WORKSHOP <span>• 7 May 2026</span></p>
          <p class="card-title">Prompt Engineering: Talk to AI in Design</p>
          <p class="card-time">🕒 2:00 PM – 4:00 PM &nbsp;&nbsp; 📍 Workshop Room 1 • Hybrid</p>
        </div>
      </div>

      <div style="margin:25px 0 20px;">
        <div style="display:inline-block;padding:6px 16px;background:#3b82f6;border-radius:50px;font-size:11px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:1px;">DAY 2 — 8 MAY 2026</div>
      </div>

      <div class="event-card">
        <div class="card-left"><img src="https://myirtiqa.com/icons/Clinical-Audit.png" width="50" height="50" style="width: 50px; height: 50px; border-radius: 10px; display: block;" alt="icon" /></div>
        <div class="card-middle">
          <p class="card-meta">HANDS-ON WORKSHOP <span>• 8 May 2026</span></p>
          <p class="card-title">Suturing with a Plastic Surgeon</p>
          <p class="card-time">🕒 Full Day: 10 AM – 12 PM & 2 – 4 PM &nbsp;&nbsp; 📍 Skills Lab</p>
        </div>
      </div>

      <div class="event-card">
        <div class="card-left"><img src="https://myirtiqa.com/icons/Thinking-Like-a-Builder.png" width="50" height="50" style="width: 50px; height: 50px; border-radius: 10px; display: block;" alt="icon" /></div>
        <div class="card-middle">
          <p class="card-meta">WORKSHOP <span>• 8 May 2026</span></p>
          <p class="card-title">How to Build and Scale a Startup</p>
          <p class="card-time">🕒 2:00 PM – 4:00 PM &nbsp;&nbsp; 📍 Workshop Room 2 • Hybrid</p>
        </div>
      </div>

      <div style="margin:25px 0 20px;">
        <div style="display:inline-block;padding:6px 16px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:50px;font-size:11px;font-weight:700;color:#fff;text-transform:uppercase;letter-spacing:1px;">DAY 3 — 9 MAY 2026 • MAIN EVENT</div>
      </div>

      <div class="event-card">
        <div class="card-middle">
          <p class="card-meta">MAIN CONFERENCE <span>• 9 May 2026</span></p>
          <p class="card-title">Keynotes, Panel Discussion & AI Competitions</p>
          <p class="card-time">🕒 Full Day &nbsp;&nbsp; 📍 Northwest School of Medicine, Peshawar</p>
        </div>
      </div>
    </div>
  `;
}

function getShareBlockHtml() {
  return `
    <div class="share-block">
      <p class="share-title">SHARE WITH YOUR COLLEAGUES!</p>
      <p class="share-text">Scientific progress is collaborative. Forward this email to a friend or share the registration link to encourage them to join this landmark symposium!</p>
      <a href="https://myirtiqa.com/ai-symposium" style="display:inline-block; padding:10px 24px; background-color:#111827; color:#fff; font-size:12px; font-weight:700; text-transform:uppercase; text-decoration:none; border-radius:50px;">Copy Event Link</a>
    </div>
    
    <div class="footer-venue">
      <p class="venue-text">Venue: Northwest School of Medicine, Peshawar</p>
      <p style="font-size:12px; color:#6b7280; margin:0 0 10px;">May 7-9, 2026</p>
      <div class="footer-links">
        <a href="https://myirtiqa.com/ai-symposium">Full Program</a>
        <a href="mailto:info@myirtiqa.com">Contact Support</a>
      </div>
    </div>
  `;
}

/* ═══════ WhatsApp block builder ═══════ */
function buildWhatsAppBlock(links: { name: string; url: string }[]): string {
  if (links.length === 0) return "";
  
  const buttons = links.map(l => `
    <tr><td style="padding: 6px 0;">
      <a href="${l.url}" style="display:inline-block; width: 100%; max-width: 400px; padding:14px 24px; background-color:#25D366; color:#ffffff; font-size:13px; font-weight:700; text-decoration:none; border-radius:12px; text-align:center; box-sizing:border-box;">
        📱 Join: ${l.name}
      </a>
    </td></tr>
  `).join("");

  return `
    <div style="background: linear-gradient(135deg, #128C7E 0%, #25D366 100%); border-radius: 16px; padding: 30px; text-align: center; margin: 0 0 10px;">
      <p style="font-size:11px; font-weight:700; color:rgba(255,255,255,0.8); text-transform:uppercase; letter-spacing:2px; margin:0 0 5px;">⚡ IMPORTANT — JOIN NOW</p>
      <p style="font-size:20px; font-weight:900; color:#ffffff; text-transform:uppercase; margin:0 0 8px;">Join Your WhatsApp Group</p>
      <p style="font-size:12px; color:rgba(255,255,255,0.8); margin:0 0 20px; line-height:1.5;">
        Stay updated with announcements, schedules, and connect with fellow participants. This is <strong>required</strong> — don't miss out!
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${buttons}
      </table>
    </div>
  `;
}

/* ═══════ Confirmation email HTML ═══════ */
function buildConfirmationHtml(name: string, type: string, extras: { workshops?: string[] } = {}): string {
  let headerWord = "REGISTRATION";
  if (type === "ambassador") headerWord = "APPLICATION";
  else if (["pitch", "poster", "quiz", "drill", "debate", "meme"].includes(type)) headerWord = "SUBMISSION";

  let typeFormatted = type.charAt(0).toUpperCase() + type.slice(1) + " Registration";
  if (type === "registration") typeFormatted = "Symposium Registration";
  else if (type === "ambassador") typeFormatted = "Campus Ambassador Application";
  else if (["pitch", "poster", "quiz", "drill", "debate", "meme"].includes(type)) typeFormatted = COMPETITION_NAMES[type] || "Competition Submission";

  // Build WhatsApp links for confirmation
  const waLinks: { name: string; url: string }[] = [];
  if (["pitch", "poster", "quiz", "drill", "debate"].includes(type) && WHATSAPP_LINKS[type]) {
    waLinks.push({ name: COMPETITION_NAMES[type] || type, url: WHATSAPP_LINKS[type] });
  }
  if (extras.workshops) {
    extras.workshops.forEach(wsId => {
      if (WHATSAPP_LINKS[wsId]) {
        waLinks.push({ name: WORKSHOP_NAMES[wsId] || wsId, url: WHATSAPP_LINKS[wsId] });
      }
    });
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${EMAIL_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="dark-header" style="background-color: transparent; padding: 0;">
        <img src="https://myirtiqa.com/Email-Header.png" alt="AI SYMPOSIUM 2026" style="width: 100%; height: auto; display: block;" />
      </div>
      
      <div class="content-body">
        <p class="greeting">Hello, ${name}!</p>
        <h2 class="main-heading">YOUR ${headerWord} <br><span>HAS BEEN RECEIVED</span></h2>
        
        <p class="intro-text">
          Thank you for joining us for SYMPOSIUM 2026. We're thrilled to have you! We are officially confirming your submission for this pioneering event on Scientific AI.
        </p>
        
        <div class="next-steps">
          <strong>NEXT STEPS:</strong> Your ${typeFormatted} has been securely stored in our systems. Our team will review your payment and send a confirmation email within 24-48 hours. Keep an eye out!
        </div>
        
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://myirtiqa.com/Ticket-Preview.png" alt="Ticket Preview" style="width: 100%; max-width: 400px; height: auto; border-radius: 12px; display: inline-block;" />
        </div>

        ${waLinks.length > 0 ? buildWhatsAppBlock(waLinks) : ""}
      </div>
      
      ${getAgendaHtml()}
      ${getShareBlockHtml()}
    </div>
  </div>
</body>
</html>
  `;
}

/* ═══════ APPROVAL email HTML (customized per type) ═══════ */
function buildApprovalHtml(
  name: string,
  type: string,
  registrationCode?: string,
  notes?: string,
  workshops?: string[],
): string {
  // Determine what they registered for
  const isRegistration = type === "registration" || type === "registrations";
  const isCompetition = ["pitch", "poster", "quiz", "drill", "debate", "meme"].includes(type);
  const isAmbassador = type === "ambassador" || type === "ambassador applications";

  // Build descriptive title
  let eventTitle = "AI Symposium 2026";
  let eventSubtitle = "May 7-9, 2026 — Northwest School of Medicine, Peshawar";
  if (isCompetition) {
    eventTitle = COMPETITION_NAMES[type] || `AI ${type.charAt(0).toUpperCase() + type.slice(1)} Competition`;
    eventSubtitle = "Day 3 — 9 May 2026 — Northwest School of Medicine, Peshawar";
  }

  // Registration code block
  const codeBlock = registrationCode
    ? `<div style="margin: 25px 0;">
        <div style="text-align: center;">
          <img src="https://myirtiqa.com/Ticket-Preview.png" alt="Ticket Preview" style="width: 100%; max-width: 400px; height: auto; border-radius: 12px; display: inline-block;" />
        </div>
        <div style="font-size:28px; letter-spacing:6px; padding: 15px 40px; margin-top:15px; font-weight: 900; color: #3b82f6; text-align:center;">${registrationCode}</div>
        <p style="font-size:10px;color:#a1a1aa;text-transform:uppercase; text-align:center; letter-spacing:2px;">YOUR REGISTRATION CODE</p>
      </div>`
    : "";

  // Notes block
  const notesBlock = notes
    ? `<div class="next-steps"><strong>Note from organizers:</strong><br>${notes}</div>`
    : "";

  // Build WhatsApp links
  const waLinks: { name: string; url: string }[] = [];
  
  // For competitions — add the competition WhatsApp group
  if (isCompetition && WHATSAPP_LINKS[type]) {
    waLinks.push({ name: COMPETITION_NAMES[type] || type, url: WHATSAPP_LINKS[type] });
  }
  
  // For registrations — add workshop WhatsApp groups
  if (isRegistration && workshops && workshops.length > 0) {
    workshops.forEach(wsId => {
      if (WHATSAPP_LINKS[wsId]) {
        waLinks.push({ name: WORKSHOP_NAMES[wsId] || wsId, url: WHATSAPP_LINKS[wsId] });
      }
    });
  }

  // Build workshop summary for registrations
  let workshopSummary = "";
  if (isRegistration && workshops && workshops.length > 0) {
    const wsItems = workshops.map(wsId => {
      const name = WORKSHOP_NAMES[wsId] || wsId;
      return `<li style="margin-bottom:6px; color:#374151;">${name}</li>`;
    }).join("");
    workshopSummary = `
      <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:12px; padding:20px; margin:20px 0; text-align:left;">
        <p style="font-size:11px; font-weight:700; color:#0369a1; text-transform:uppercase; letter-spacing:1px; margin:0 0 10px;">📋 Your Registered Workshops</p>
        <ul style="font-size:13px; padding-left:20px; margin:0; line-height:1.8;">${wsItems}</ul>
      </div>
    `;
  }

  // What to bring section
  const whatToBring = `
    <div style="background:#fefce8; border:1px solid #fde047; border-radius:12px; padding:20px; margin:20px 0; text-align:left;">
      <p style="font-size:11px; font-weight:700; color:#a16207; text-transform:uppercase; letter-spacing:1px; margin:0 0 10px;">📌 What to Bring</p>
      <ul style="font-size:13px; color:#374151; padding-left:20px; margin:0; line-height:1.8;">
        <li>Valid university/college ID card</li>
        <li>This email (screenshot or printed)</li>
        ${registrationCode ? `<li>Your registration code: <strong>${registrationCode}</strong></li>` : ""}
        <li>Notebook and pen for workshop notes</li>
      </ul>
    </div>
  `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${EMAIL_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="dark-header" style="background-color: transparent; padding: 0;">
        <img src="https://myirtiqa.com/Email-Header.png" alt="AI SYMPOSIUM 2026" style="width: 100%; height: auto; display: block;" />
      </div>
      
      <div class="content-body">
        <p class="greeting">Hello, ${name}! 🎉</p>
        <h2 class="main-heading">YOU'RE <span>APPROVED!</span></h2>
        
        <p class="intro-text">
          Great news! Your ${isCompetition ? eventTitle + " entry" : isAmbassador ? "Campus Ambassador application" : "registration for the AI Symposium 2026"} has been reviewed and <strong style="color:#059669;">approved</strong>. We are absolutely thrilled to welcome you!
        </p>

        <div style="display:inline-block; padding:8px 24px; background:linear-gradient(135deg,#dcfce7,#bbf7d0); color:#166534; font-weight:900; border-radius:50px; font-size:13px; text-transform:uppercase; letter-spacing:1px; margin-bottom:20px;">✅ APPROVED & CONFIRMED</div>
        
        ${codeBlock}
        ${workshopSummary}
        ${notesBlock}

        ${waLinks.length > 0 ? buildWhatsAppBlock(waLinks) : ""}

        ${whatToBring}
      </div>
      
      ${getAgendaHtml()}
      ${getShareBlockHtml()}
    </div>
  </div>
</body>
</html>
  `;
}

/* ═══════ REJECTION email HTML ═══════ */
function buildRejectionHtml(name: string, type: string, notes?: string): string {
  const isCompetition = ["pitch", "poster", "quiz", "drill", "debate", "meme"].includes(type);
  const typeLabel = isCompetition
    ? (COMPETITION_NAMES[type] || type)
    : type === "ambassador" ? "Campus Ambassador application" : "AI Symposium registration";

  const notesBlock = notes
    ? `<div class="next-steps"><strong>Feedback from organizers:</strong><br>${notes}</div>`
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${EMAIL_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="dark-header" style="background-color: transparent; padding: 0;">
        <img src="https://myirtiqa.com/Email-Header.png" alt="AI SYMPOSIUM 2026" style="width: 100%; height: auto; display: block;" />
      </div>
      
      <div class="content-body">
        <p class="greeting">Hello, ${name},</p>
        <h2 class="main-heading">APPLICATION <span style="color:#ec4899;">UPDATE</span></h2>
        
        <p class="intro-text">
          We appreciate your interest in the AI Symposium 2026. After careful review, we were unfortunately unable to approve your ${typeLabel} at this time.
        </p>

        <div style="display:inline-block; padding:8px 24px; background:#fee2e2; color:#991b1b; font-weight:900; border-radius:50px; font-size:13px; text-transform:uppercase; letter-spacing:1px;">STATUS: NOT APPROVED</div>
        
        ${notesBlock}
        
        <div style="margin-top:25px;">
          <p class="intro-text">If you believe there has been an error, or you'd like to reapply, please reach out to us at <a href="mailto:info@myirtiqa.com" style="color:#3b82f6; font-weight:600;">info@myirtiqa.com</a>.</p>
        </div>
      </div>
      
      ${getShareBlockHtml()}
    </div>
  </div>
</body>
</html>
  `;
}

/* ═══════ Subject lines ═══════ */
function getConfirmationSubject(type: string): string {
  switch (type) {
    case "registration": return "Registration Received — AI Symposium 2026";
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

function getApprovalSubject(type: string, code?: string): string {
  const isComp = ["pitch", "poster", "quiz", "drill", "debate", "meme"].includes(type);
  const label = isComp ? (COMPETITION_NAMES[type] || type) : "AI Symposium 2026";
  return `✅ You're Approved! — ${label}${code ? ` (Code: ${code})` : ""}`;
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
    const {
      mode = "status_update",
      to,
      name,
      status,
      type,
      notes,
      registrationCode,
      workshops,   // string[] of workshop IDs
    } = body;

    console.log(`[EMAIL] mode=${mode} to=${to} type=${type} status=${status} workshops=${JSON.stringify(workshops)}`);

    if (!RESEND_API_KEY) {
      console.log(`[EMAIL] Would send ${mode} email to ${to} for ${type} (no RESEND_API_KEY configured)`);
      return new Response(
        JSON.stringify({ success: true, message: "Email logged (no RESEND_API_KEY)" }),
        { headers: corsHeaders }
      );
    }

    let html: string;
    let subject: string;
    let fromAddr: string;

    if (mode === "confirmation") {
      // Sent immediately after form submission
      html = buildConfirmationHtml(name, type, { workshops });
      subject = getConfirmationSubject(type);
      fromAddr = FROM_ADDRESSES[type] || FROM_ADDRESSES.default;
    } else {
      // Status update (approval/rejection) from admin
      if (status === "approved") {
        html = buildApprovalHtml(name, type, registrationCode, notes, workshops);
        subject = getApprovalSubject(type, registrationCode);
      } else {
        html = buildRejectionHtml(name, type, notes);
        subject = `Update on your submission — AI Symposium 2026`;
      }
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
      console.error("[EMAIL ERROR] Resend API failed:", JSON.stringify(data));
    } else {
      console.log(`[EMAIL SUCCESS] Sent ${mode} email to ${to} (type: ${type}, status: ${status || "n/a"})`);
    }

    return new Response(JSON.stringify({ success: res.ok, ...data }), { headers: corsHeaders });
  } catch (error: any) {
    console.error("[EMAIL ERROR] Exception:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
