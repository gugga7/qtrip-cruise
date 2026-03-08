import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

function getResendKey(): string | undefined {
  return Deno.env.get("RESEND_API_KEY");
}
function getFromEmail(): string {
  return Deno.env.get("FROM_EMAIL") || "QTRIP <noreply@qtrip.app>";
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type EmailTemplate = "quote_submitted" | "quote_received" | "booking_confirmed" | "group_invite";

interface EmailRequest {
  to: string;
  template: EmailTemplate;
  data: Record<string, string>;
  locale?: "en" | "fr";
}

/* ── HTML wrapper ── */
function wrapHtml(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
  <div style="background:linear-gradient(135deg,#ec4899,#d946ef);padding:32px 24px;text-align:center">
    <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700">QTRIP</h1>
  </div>
  <div style="padding:32px 24px">${body}</div>
  <div style="padding:16px 24px;background:#f8fafc;text-align:center;border-top:1px solid #e2e8f0">
    <p style="margin:0;font-size:12px;color:#94a3b8">&copy; ${new Date().getFullYear()} QTRIP. All rights reserved.</p>
  </div>
</div>
</body>
</html>`;
}

/* ── Templates ── */
const templates: Record<EmailTemplate, Record<"en" | "fr", { subject: (d: Record<string, string>) => string; body: (d: Record<string, string>) => string }>> = {
  quote_submitted: {
    en: {
      subject: (d) => `Quote request received — ${d.reference}`,
      body: (d) => `
        <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px">Your quote request is in!</h2>
        <p style="color:#64748b;font-size:14px;line-height:1.6">
          Thanks ${d.name}! We've received your trip request for <strong>${d.destination}</strong>.
        </p>
        <div style="margin:24px 0;padding:16px;background:#f8fafc;border-radius:12px">
          <p style="margin:0 0 8px;font-size:13px;color:#94a3b8">Reference</p>
          <p style="margin:0;font-size:18px;font-weight:700;color:#0f172a;letter-spacing:1px">${d.reference}</p>
        </div>
        <div style="margin:24px 0;padding:16px;background:#f8fafc;border-radius:12px">
          <table style="width:100%;font-size:14px;color:#334155">
            <tr><td style="padding:4px 0;color:#94a3b8">Destination</td><td style="padding:4px 0;text-align:right;font-weight:600">${d.destination}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8">Dates</td><td style="padding:4px 0;text-align:right;font-weight:600">${d.dates}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8">Travelers</td><td style="padding:4px 0;text-align:right;font-weight:600">${d.travelers}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8">Estimated total</td><td style="padding:4px 0;text-align:right;font-weight:600">${d.total}</td></tr>
          </table>
        </div>
        <h3 style="margin:24px 0 12px;font-size:15px;color:#0f172a">What happens next?</h3>
        <ol style="margin:0;padding-left:20px;font-size:14px;color:#64748b;line-height:1.8">
          <li>We review availability for your selections</li>
          <li>We send you a final quote with confirmed prices</li>
          <li>You confirm and we lock in your celebration</li>
        </ol>`,
    },
    fr: {
      subject: (d) => `Demande de devis reçue — ${d.reference}`,
      body: (d) => `
        <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px">Votre demande de devis est enregistrée !</h2>
        <p style="color:#64748b;font-size:14px;line-height:1.6">
          Merci ${d.name} ! Nous avons bien reçu votre demande pour <strong>${d.destination}</strong>.
        </p>
        <div style="margin:24px 0;padding:16px;background:#f8fafc;border-radius:12px">
          <p style="margin:0 0 8px;font-size:13px;color:#94a3b8">Référence</p>
          <p style="margin:0;font-size:18px;font-weight:700;color:#0f172a;letter-spacing:1px">${d.reference}</p>
        </div>
        <div style="margin:24px 0;padding:16px;background:#f8fafc;border-radius:12px">
          <table style="width:100%;font-size:14px;color:#334155">
            <tr><td style="padding:4px 0;color:#94a3b8">Destination</td><td style="padding:4px 0;text-align:right;font-weight:600">${d.destination}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8">Dates</td><td style="padding:4px 0;text-align:right;font-weight:600">${d.dates}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8">Voyageurs</td><td style="padding:4px 0;text-align:right;font-weight:600">${d.travelers}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8">Total estimé</td><td style="padding:4px 0;text-align:right;font-weight:600">${d.total}</td></tr>
          </table>
        </div>
        <h3 style="margin:24px 0 12px;font-size:15px;color:#0f172a">Et ensuite ?</h3>
        <ol style="margin:0;padding-left:20px;font-size:14px;color:#64748b;line-height:1.8">
          <li>Nous vérifions la disponibilité</li>
          <li>Nous vous envoyons un devis final</li>
          <li>Vous confirmez et nous réservons votre fête</li>
        </ol>`,
    },
  },

  quote_received: {
    en: {
      subject: (d) => `New quote request from ${d.name} — ${d.reference}`,
      body: (d) => `
        <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px">New quote request</h2>
        <p style="color:#64748b;font-size:14px;line-height:1.6">
          <strong>${d.name}</strong> (${d.email}) submitted a quote request.
        </p>
        <div style="margin:24px 0;padding:16px;background:#fdf2f8;border-radius:12px">
          <table style="width:100%;font-size:14px;color:#334155">
            <tr><td style="padding:4px 0;color:#94a3b8">Reference</td><td style="padding:4px 0;text-align:right;font-weight:600">${d.reference}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8">Destination</td><td style="padding:4px 0;text-align:right;font-weight:600">${d.destination}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8">Dates</td><td style="padding:4px 0;text-align:right;font-weight:600">${d.dates}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8">Travelers</td><td style="padding:4px 0;text-align:right;font-weight:600">${d.travelers}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8">Estimated total</td><td style="padding:4px 0;text-align:right;font-weight:600">${d.total}</td></tr>
          </table>
        </div>
        ${d.notes ? `<div style="margin:16px 0;padding:12px 16px;background:#fffbeb;border-radius:8px;font-size:13px;color:#92400e"><strong>Notes:</strong> ${d.notes}</div>` : ""}
        <a href="${d.adminUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:linear-gradient(135deg,#ec4899,#d946ef);color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600">Review in admin panel</a>`,
    },
    fr: {
      subject: (d) => `Nouvelle demande de ${d.name} — ${d.reference}`,
      body: (d) => `
        <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px">Nouvelle demande de devis</h2>
        <p style="color:#64748b;font-size:14px;line-height:1.6">
          <strong>${d.name}</strong> (${d.email}) a soumis une demande de devis.
        </p>
        <div style="margin:24px 0;padding:16px;background:#fdf2f8;border-radius:12px">
          <table style="width:100%;font-size:14px;color:#334155">
            <tr><td style="padding:4px 0;color:#94a3b8">Référence</td><td style="padding:4px 0;text-align:right;font-weight:600">${d.reference}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8">Destination</td><td style="padding:4px 0;text-align:right;font-weight:600">${d.destination}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8">Dates</td><td style="padding:4px 0;text-align:right;font-weight:600">${d.dates}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8">Voyageurs</td><td style="padding:4px 0;text-align:right;font-weight:600">${d.travelers}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8">Total estimé</td><td style="padding:4px 0;text-align:right;font-weight:600">${d.total}</td></tr>
          </table>
        </div>
        ${d.notes ? `<div style="margin:16px 0;padding:12px 16px;background:#fffbeb;border-radius:8px;font-size:13px;color:#92400e"><strong>Notes :</strong> ${d.notes}</div>` : ""}
        <a href="${d.adminUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:linear-gradient(135deg,#ec4899,#d946ef);color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:600">Voir dans l'admin</a>`,
    },
  },

  booking_confirmed: {
    en: {
      subject: (d) => `Booking confirmed! — ${d.reference}`,
      body: (d) => `
        <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px">Your trip is confirmed! 🎉</h2>
        <p style="color:#64748b;font-size:14px;line-height:1.6">
          Great news, ${d.name}! Your trip to <strong>${d.destination}</strong> is locked in.
        </p>
        <div style="margin:24px 0;padding:16px;background:#f0fdf4;border-radius:12px;text-align:center">
          <p style="margin:0 0 4px;font-size:13px;color:#16a34a">Confirmed</p>
          <p style="margin:0;font-size:22px;font-weight:700;color:#0f172a">${d.destination}</p>
          <p style="margin:8px 0 0;font-size:14px;color:#64748b">${d.dates} &middot; ${d.travelers} travelers</p>
        </div>
        <div style="margin:24px 0;padding:16px;background:#f8fafc;border-radius:12px">
          <table style="width:100%;font-size:14px;color:#334155">
            <tr><td style="padding:4px 0;color:#94a3b8">Reference</td><td style="padding:4px 0;text-align:right;font-weight:600">${d.reference}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8">Final price</td><td style="padding:4px 0;text-align:right;font-weight:600">${d.total}</td></tr>
          </table>
        </div>
        <p style="font-size:14px;color:#64748b;line-height:1.6">We'll send you your detailed itinerary closer to the date. If you have questions, just reply to this email.</p>`,
    },
    fr: {
      subject: (d) => `Réservation confirmée ! — ${d.reference}`,
      body: (d) => `
        <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px">Votre voyage est confirmé ! 🎉</h2>
        <p style="color:#64748b;font-size:14px;line-height:1.6">
          Bonne nouvelle, ${d.name} ! Votre voyage à <strong>${d.destination}</strong> est validé.
        </p>
        <div style="margin:24px 0;padding:16px;background:#f0fdf4;border-radius:12px;text-align:center">
          <p style="margin:0 0 4px;font-size:13px;color:#16a34a">Confirmé</p>
          <p style="margin:0;font-size:22px;font-weight:700;color:#0f172a">${d.destination}</p>
          <p style="margin:8px 0 0;font-size:14px;color:#64748b">${d.dates} &middot; ${d.travelers} voyageurs</p>
        </div>
        <div style="margin:24px 0;padding:16px;background:#f8fafc;border-radius:12px">
          <table style="width:100%;font-size:14px;color:#334155">
            <tr><td style="padding:4px 0;color:#94a3b8">Référence</td><td style="padding:4px 0;text-align:right;font-weight:600">${d.reference}</td></tr>
            <tr><td style="padding:4px 0;color:#94a3b8">Prix final</td><td style="padding:4px 0;text-align:right;font-weight:600">${d.total}</td></tr>
          </table>
        </div>
        <p style="font-size:14px;color:#64748b;line-height:1.6">Nous vous enverrons votre itinéraire détaillé à l'approche de la date. Pour toute question, répondez simplement à cet e-mail.</p>`,
    },
  },

  group_invite: {
    en: {
      subject: (d) => `You're invited to join ${d.groupName}!`,
      body: (d) => `
        <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px">You're invited!</h2>
        <p style="color:#64748b;font-size:14px;line-height:1.6">
          <strong>${d.organizerName}</strong> invited you to join <strong>${d.groupName}</strong> — a trip to ${d.destination}.
        </p>
        <div style="margin:24px 0;padding:20px;background:#fdf2f8;border-radius:12px;text-align:center">
          <p style="margin:0 0 8px;font-size:13px;color:#be185d">Your invite code</p>
          <p style="margin:0;font-size:28px;font-weight:700;color:#0f172a;letter-spacing:3px">${d.inviteCode}</p>
        </div>
        <a href="${d.joinUrl}" style="display:block;margin:16px 0;padding:14px;background:linear-gradient(135deg,#ec4899,#d946ef);color:#fff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:600;text-align:center">Join the group</a>
        <p style="font-size:13px;color:#94a3b8;text-align:center">Or go to ${d.joinUrl} and enter the code above.</p>`,
    },
    fr: {
      subject: (d) => `Vous êtes invité(e) à rejoindre ${d.groupName} !`,
      body: (d) => `
        <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px">Vous êtes invité(e) !</h2>
        <p style="color:#64748b;font-size:14px;line-height:1.6">
          <strong>${d.organizerName}</strong> vous invite à rejoindre <strong>${d.groupName}</strong> — un voyage à ${d.destination}.
        </p>
        <div style="margin:24px 0;padding:20px;background:#fdf2f8;border-radius:12px;text-align:center">
          <p style="margin:0 0 8px;font-size:13px;color:#be185d">Votre code d'invitation</p>
          <p style="margin:0;font-size:28px;font-weight:700;color:#0f172a;letter-spacing:3px">${d.inviteCode}</p>
        </div>
        <a href="${d.joinUrl}" style="display:block;margin:16px 0;padding:14px;background:linear-gradient(135deg,#ec4899,#d946ef);color:#fff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:600;text-align:center">Rejoindre le groupe</a>
        <p style="font-size:13px;color:#94a3b8;text-align:center">Ou rendez-vous sur ${d.joinUrl} et entrez le code ci-dessus.</p>`,
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = getResendKey();
    const FROM_EMAIL = getFromEmail();

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const { to, template, data, locale = "en" }: EmailRequest = await req.json();

    const tmpl = templates[template]?.[locale];
    if (!tmpl) {
      throw new Error(`Unknown template "${template}" for locale "${locale}"`);
    }

    const subject = tmpl.subject(data);
    const html = wrapHtml(tmpl.body(data));

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Resend API error: ${response.status} ${err}`);
    }

    const result = await response.json();
    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-email error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
