// Edge Function: send-symposium-email
// Deploy to Supabase Edge Functions
// Requires RESEND_API_KEY secret set in Supabase Dashboard

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

/* ═══════ Email "from" addresses ═══════ */
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
  body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
  .wrapper { width: 100%; table-layout: fixed; background-color: #1a1a2e; padding-top: 20px; padding-bottom: 40px; }
  .container { max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
  .dark-header { background-color: #111827; padding: 0; text-align: center; }
  .dark-header img { width: 100%; height: auto; display: block; }
  .title-logo { font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: 2px; text-transform: uppercase margin: 0; display: flex; align-items: center; justify-content: center; gap: 10px; }
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
      
      <div class="event-card">
        <div class="card-left"><img src="https://myirtiqa.com/icons/AI-Note-Taking.png" width="50" height="50" style="width: 50px; height: 50px; border-radius: 10px; display: block;" alt="icon" /></div>
        <div class="card-middle">
          <p class="card-meta">WORKSHOP <span>• 10 Apr 2026</span></p>
          <p class="card-title">AI for Note Taking</p>
          <p class="card-time">🕒 10:00 AM – 12:00 PM &nbsp;&nbsp; 📍 Workshop Room 1</p>
          <table style="margin-top: 10px; width: 100%;" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="width: 40px; vertical-align: middle;">
                <img src="https://i.ibb.co/LdhCMhkb/Haroon-Head-SHot.png" width="32" height="32" style="width: 32px; height: 32px; border-radius: 50%; display: block; object-fit: cover;" alt="Muhammad Haroon" />
              </td>
              <td style="vertical-align: middle;">
                <p style="font-size: 11px; font-weight: 700; color: #ffffff; margin: 0 0 2px 0;">Muhammad Haroon</p>
                <p style="font-size: 9px; color: rgba(255,255,255,0.5); margin: 0;">AI Specialist & App Developer</p>
              </td>
            </tr>
          </table>
        </div>
      </div>
      
      <div class="event-card">
        <div class="card-left"><img src="https://myirtiqa.com/icons/Prompt-Engineering.png" width="50" height="50" style="width: 50px; height: 50px; border-radius: 10px; display: block;" alt="icon" /></div>
        <div class="card-middle">
          <p class="card-meta">WORKSHOP <span>• 10 Apr 2026</span></p>
          <p class="card-title">Prompt Engineering & Talk to AI in Design</p>
          <p class="card-time">🕒 10:00 AM – 12:00 PM &nbsp;&nbsp; 📍 Workshop Room 2</p>
          <table style="margin-top: 10px; width: 100%;" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="width: 40px; vertical-align: middle;">
                <img src="https://i.ibb.co/FkGZRYpd/Asad-Head-SHot.png" width="32" height="32" style="width: 32px; height: 32px; border-radius: 50%; display: block; object-fit: cover;" alt="Asad Raziq" />
              </td>
              <td style="vertical-align: middle;">
                <p style="font-size: 11px; font-weight: 700; color: #ffffff; margin: 0 0 2px 0;">Asad Raziq</p>
                <p style="font-size: 9px; color: rgba(255,255,255,0.5); margin: 0;">Visual Artist</p>
              </td>
            </tr>
          </table>
        </div>
      </div>
      
      <div class="event-card">
        <div class="card-left"><img src="https://myirtiqa.com/icons/AI-in-Research.png" width="50" height="50" style="width: 50px; height: 50px; border-radius: 10px; display: block;" alt="icon" /></div>
        <div class="card-middle">
          <p class="card-meta">WORKSHOP <span>• 10 Apr 2026</span></p>
          <p class="card-title">AI in Research</p>
          <p class="card-time">🕒 2:00 PM – 4:00 PM &nbsp;&nbsp; 📍 Workshop Room 1</p>
          <table style="margin-top: 10px; width: 100%;" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="width: 40px; vertical-align: middle;">
                <img src="https://i.ibb.co/Y70W3nx6/Iftikhar-khan-Head-SHot.png" width="32" height="32" style="width: 32px; height: 32px; border-radius: 50%; display: block; object-fit: cover;" alt="Iftikhar" />
              </td>
              <td style="vertical-align: middle;">
                <p style="font-size: 11px; font-weight: 700; color: #ffffff; margin: 0 0 2px 0;">Iftikhar</p>
                <p style="font-size: 9px; color: rgba(255,255,255,0.5); margin: 0;">Founder IRC | 61 Publications</p>
              </td>
            </tr>
          </table>
        </div>
      </div>
      
      <div class="event-card">
        <div class="card-left"><img src="https://myirtiqa.com/icons/Clinical-Audit.png" width="50" height="50" style="width: 50px; height: 50px; border-radius: 10px; display: block;" alt="icon" /></div>
        <div class="card-middle">
          <p class="card-meta">WORKSHOP <span>• 10 Apr 2026</span></p>
          <p class="card-title">Clinical Audit & AI in Clinical Use</p>
          <p class="card-time">🕒 2:00 PM – 4:00 PM &nbsp;&nbsp; 📍 Workshop Room 2</p>
          <table style="margin-top: 10px; width: 100%;" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="width: 40px; vertical-align: middle;">
                <img src="https://i.ibb.co/gbhNLhWy/Almas-Fasih-Khattak.jpg" width="32" height="32" style="width: 32px; height: 32px; border-radius: 50%; display: block; object-fit: cover;" alt="Dr. Almas" />
              </td>
              <td style="vertical-align: middle;">
                <p style="font-size: 11px; font-weight: 700; color: #ffffff; margin: 0 0 2px 0;">Dr. Almas Fasih Khattak</p>
                <p style="font-size: 9px; color: rgba(255,255,255,0.5); margin: 0;">Director Research HMC</p>
              </td>
            </tr>
          </table>
        </div>
      </div>
      
      <div class="event-card">
        <div class="card-left"><img src="https://myirtiqa.com/icons/AI-and-the-Future-of-Global-Surgery.png" width="50" height="50" style="width: 50px; height: 50px; border-radius: 10px; display: block;" alt="icon" /></div>
        <div class="card-middle">
          <p class="card-meta">KEYNOTE <span>• 11 Apr 2026</span></p>
          <p class="card-title">AI and the Future of Global Surgery</p>
          <p class="card-time">🕒 Morning Session &nbsp;&nbsp; 📍 Main Auditorium</p>
        </div>
      </div>
      
      <div class="event-card">
        <div class="card-left"><img src="https://myirtiqa.com/icons/Thinking-Like-a-Builder.png" width="50" height="50" style="width: 50px; height: 50px; border-radius: 10px; display: block;" alt="icon" /></div>
        <div class="card-middle">
          <p class="card-meta">KEYNOTE <span>• 11 Apr 2026</span></p>
          <p class="card-title">Thinking Like a Builder: AI Solutions in Healthcare</p>
          <p class="card-time">🕒 Midday Session &nbsp;&nbsp; 📍 Main Auditorium</p>
        </div>
      </div>

      <div class="event-card">
        <div class="card-left"><img src="https://myirtiqa.com/icons/Human-Expertise-vs-AI-Systems.png" width="50" height="50" style="width: 50px; height: 50px; border-radius: 10px; display: block;" alt="icon" /></div>
        <div class="card-middle">
          <p class="card-meta">PANEL <span>• 11 Apr 2026</span></p>
          <p class="card-title">Human Expertise vs AI Systems</p>
          <p class="card-time">🕒 60 Minutes &nbsp;&nbsp; 📍 Main Auditorium</p>
        </div>
      </div>

      <div class="event-card">
        <div class="card-left"><img src="https://myirtiqa.com/icons/AI-Poster-Competition.png" width="50" height="50" style="width: 50px; height: 50px; border-radius: 10px; display: block;" alt="icon" /></div>
        <div class="card-middle">
          <p class="card-meta">COMPETITION <span>• 11 Apr 2026</span></p>
          <p class="card-title">AI Poster Competition</p>
          <p class="card-time">🕒 TBA &nbsp;&nbsp; 📍 Front Lobby</p>
        </div>
      </div>

      <div class="event-card">
        <div class="card-left"><img src="https://myirtiqa.com/icons/AI-Drill.png" width="50" height="50" style="width: 50px; height: 50px; border-radius: 10px; display: block;" alt="icon" /></div>
        <div class="card-middle">
          <p class="card-meta">COMPETITION <span>• 11 Apr 2026</span></p>
          <p class="card-title">AI Drill</p>
          <p class="card-time">🕒 1 Hour &nbsp;&nbsp; 📍 Computer Lab</p>
        </div>
      </div>

      <div class="event-card">
        <div class="card-left"><img src="https://myirtiqa.com/icons/AI-Debate.png" width="50" height="50" style="width: 50px; height: 50px; border-radius: 10px; display: block;" alt="icon" /></div>
        <div class="card-middle">
          <p class="card-meta">COMPETITION <span>• 11 Apr 2026</span></p>
          <p class="card-title">AI Debate</p>
          <p class="card-time">🕒 TBA &nbsp;&nbsp; 📍 Debate Hall</p>
        </div>
      </div>

      <div class="event-card">
        <div class="card-left"><img src="https://myirtiqa.com/icons/AI-Pitch-Competition.png" width="50" height="50" style="width: 50px; height: 50px; border-radius: 10px; display: block;" alt="icon" /></div>
        <div class="card-middle">
          <p class="card-meta">COMPETITION <span>• 11 Apr 2026</span></p>
          <p class="card-title">AI Pitch Competition</p>
          <p class="card-time">🕒 5m Pitch + 3m Q&A &nbsp;&nbsp; 📍 Pitch Room</p>
        </div>
      </div>

      <div class="event-card">
        <div class="card-left"><img src="https://myirtiqa.com/icons/AI-Drill.png" width="50" height="50" style="width: 50px; height: 50px; border-radius: 10px; display: block;" alt="icon" /></div>
        <div class="card-middle">
          <p class="card-meta">COMPETITION <span>• 11 Apr 2026</span></p>
          <p class="card-title">AI Quiz</p>
          <p class="card-time">🕒 TBA &nbsp;&nbsp; 📍 Quiz Hall</p>
        </div>
      </div>

      <div class="event-card">
        <div class="card-left"><img src="https://myirtiqa.com/icons/AI-Debate.png" width="50" height="50" style="width: 50px; height: 50px; border-radius: 10px; display: block;" alt="icon" /></div>
        <div class="card-middle">
          <p class="card-meta">COMPETITION <span>• 11 Apr 2026</span></p>
          <p class="card-title">AI Memes Competition</p>
          <p class="card-time">🕒 TBA &nbsp;&nbsp; 📍 Online + Venue</p>
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
      <div class="footer-links">
        <a href="https://myirtiqa.com/ai-symposium">Full Program</a>
        <a href="mailto:info@myirtiqa.com">Contact Support</a>
      </div>
    </div>
  `;
}

/* ═══════ Confirmation email HTML ═══════ */
function buildConfirmationHtml(name: string, type: string, extras: { whatsappLink?: string } = {}): string {
  const whatsappHtml = extras.whatsappLink
    ? `<div style="margin-top: 15px;"><a href="${extras.whatsappLink}" style="display:inline-block;background-color:#25d366;color:#fff;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:700;">📱 Join WhatsApp Group</a></div>`
    : "";

  let headerWord = "REGISTRATION";
  if (type === "ambassador") headerWord = "APPLICATION";
  else if (["pitch", "poster", "quiz", "drill", "debate", "meme"].includes(type)) headerWord = "SUBMISSION";

  let typeFormatted = type.charAt(0).toUpperCase() + type.slice(1) + " Registration";
  if (type === "registration") typeFormatted = "Symposium Registration";
  else if (type === "ambassador") typeFormatted = "Campus Ambassador Application";
  else if (["pitch", "poster", "quiz", "drill", "debate", "meme"].includes(type)) typeFormatted = "Competition Submission";

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
          <strong>NEXT STEPS:</strong> Your ${typeFormatted} has been securely stored in our systems. Our team will review your application soon. Keep an eye out for further updates!
        </div>
        
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://myirtiqa.com/Ticket-Preview.png" alt="Ticket Preview" style="width: 100%; max-width: 400px; height: auto; border-radius: 12px; display: inline-block;" />
        </div>
        
        ${whatsappHtml}
      </div>
      
      ${getAgendaHtml()}
      ${getShareBlockHtml()}
    </div>
  </div>
</body>
</html>
  `;
}

/* ═══════ Status update email HTML ═══════ */
function buildStatusHtml(name: string, status: string, type: string, notes: string, registrationCode?: string): string {
  const isApproved = status === "approved";
  const titleText = isApproved ? "CONGRATULATIONS!" : "APPLICATION UPDATE";
  const subText = `Your ${type} ${isApproved ? "has been reviewed and <strong>approved</strong>. We are absolutely thrilled to welcome you to the AI Symposium!" : "has been carefully reviewed. Unfortunately, we were unable to select your application at this time."}`;

  const codeBlock = (isApproved && registrationCode)
    ? `<div style="text-align: center; margin-bottom: 20px;"><img src="https://myirtiqa.com/Ticket-Preview.png" alt="Ticket Preview" style="width: 100%; max-width: 400px; height: auto; border-radius: 12px; display: inline-block;" /></div><div style="font-size:24px; letter-spacing:4px; padding: 10px 40px; margin-top:10px; font-weight: 900; color: #3b82f6;">${registrationCode}</div><p style="font-size:11px;color:#a1a1aa;text-transform:uppercase;">ORDER NO / REGISTRATION CODE</p>`
    : `<div style="display:inline-block; padding:10px 20px; background-color:${isApproved ? '#dcfce7' : '#fee2e2'}; color:${isApproved ? '#166534' : '#991b1b'}; font-weight:900; border-radius:8px; margin-top:10px;">STATUS: ${status.toUpperCase()}</div>`;

  const notesHtml = notes
    ? `<div class="next-steps"><strong>Note from organizers:</strong><br>${notes}</div>`
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
        <p class="greeting">Hello, ${name}!</p>
        <h2 class="main-heading">YOUR ${type.toUpperCase()}<br><span style="color:${isApproved ? '#3b82f6' : '#ec4899'};">${titleText}</span></h2>
        
        <p class="intro-text">${subText}</p>
        
        ${notesHtml}
        ${codeBlock}
      </div>
      
      ${isApproved ? getAgendaHtml() : ""}
      ${getShareBlockHtml()}
    </div>
  </div>
</body>
</html>
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
        Authorization: `Bearer ${RESEND_API_KEY} `,
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
      console.log(`[EMAIL SUCCESS] Sent to ${to} `);
    }

    return new Response(JSON.stringify({ success: res.ok, ...data }), { headers: corsHeaders });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
