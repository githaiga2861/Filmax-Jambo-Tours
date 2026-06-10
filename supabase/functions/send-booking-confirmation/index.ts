import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL     = "Filmax Jambo Tours <hello@filmaxjambotours.com>";
const TO_ADMIN       = "hello@filmaxjambotours.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin":  "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const body = await req.json();
    const {
      ref_number, first_name, last_name, email, phone,
      country, adults, children, travel_date,
      package_name, how_heard, message, estimated_total,
    } = body;

    const fullName     = `${first_name} ${last_name}`;
    const travellerStr = `${adults} adult${parseInt(adults) !== 1 ? "s" : ""}${parseInt(children) > 0 ? ` + ${children} child${parseInt(children) !== 1 ? "ren" : ""}` : ""}`;
    const dateStr      = travel_date ? new Date(travel_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "Flexible / To be confirmed";
    const totalStr     = estimated_total || "Quote pending — confirmed within 24 hours";
    const invoiceDate  = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const waMsg        = encodeURIComponent(`Hello Filmax Jambo Tours, I just submitted a reservation (Ref: ${ref_number}) for ${package_name}. I'd like to follow up.`);

    const guestHtml = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#080808;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:48px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#0d0d0d;border:1px solid rgba(212,175,55,0.3);">
<tr><td style="height:3px;background:linear-gradient(to right,#080808,#d4af37,#080808);"></td></tr>
<tr><td align="center" style="padding:48px 40px 16px;">
  <div style="font-size:10px;letter-spacing:7px;text-transform:uppercase;color:#d4af37;font-family:Arial,sans-serif;font-weight:700;margin-bottom:20px;">FILMAX JAMBO TOURS</div>
  <div style="width:48px;height:2px;background:linear-gradient(to right,#b8860b,#d4af37,#b8860b);margin:0 auto 20px;"></div>
  <div style="font-size:11px;letter-spacing:5px;text-transform:uppercase;color:rgba(212,175,55,0.8);font-family:Arial,sans-serif;font-weight:700;margin-bottom:14px;">RESERVATION RECEIVED</div>
  <div style="font-size:34px;font-weight:800;color:#ffffff;font-family:Georgia,serif;line-height:1.15;margin-bottom:6px;">Your Safari Awaits,</div>
  <div style="font-size:34px;font-weight:400;color:#d4af37;font-family:Georgia,serif;font-style:italic;">${first_name}.</div>
</td></tr>
<tr><td style="padding:0 40px;"><div style="height:1px;background:linear-gradient(to right,#080808,rgba(212,175,55,0.4),#080808);margin-top:28px;"></div></td></tr>
<tr><td style="padding:32px 40px 8px;font-size:16px;line-height:1.9;font-family:Georgia,serif;font-style:italic;font-weight:600;text-align:center;color:#d4b896;">
  Thank you for choosing Filmax Jambo Tours. Your reservation request for
  <span style="color:#ffffff;font-style:normal;font-weight:800;">${package_name}</span>
  has been received and is being reviewed by your dedicated concierge.<br><br>
  We will be in touch within <span style="color:#d4af37;font-style:normal;font-weight:800;">24 hours</span> to confirm availability and finalise your journey.
</td></tr>
<tr><td align="center" style="padding:24px 40px 8px;">
  <div style="border:1px solid rgba(212,175,55,0.4);background:rgba(212,175,55,0.06);padding:14px 32px;display:inline-block;">
    <div style="font-size:9px;letter-spacing:5px;text-transform:uppercase;color:rgba(212,175,55,0.7);font-family:Arial,sans-serif;font-weight:700;margin-bottom:6px;">Reservation Reference</div>
    <div style="font-size:20px;font-weight:800;color:#d4af37;font-family:Arial,sans-serif;letter-spacing:3px;">${ref_number}</div>
  </div>
</td></tr>
<tr><td style="padding:28px 40px 8px;">
  <div style="font-size:9px;letter-spacing:5px;text-transform:uppercase;color:#d4af37;font-family:Arial,sans-serif;font-weight:800;margin-bottom:16px;">Booking Summary</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(212,175,55,0.2);">
    <tr style="border-bottom:1px solid rgba(212,175,55,0.1);"><td style="padding:13px 18px;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(212,175,55,0.7);font-family:Arial,sans-serif;font-weight:700;width:38%;background:rgba(212,175,55,0.03);">Package</td><td style="padding:13px 18px;font-size:14px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">${package_name}</td></tr>
    <tr style="border-bottom:1px solid rgba(212,175,55,0.1);"><td style="padding:13px 18px;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(212,175,55,0.7);font-family:Arial,sans-serif;font-weight:700;background:rgba(212,175,55,0.03);">Lead Traveller</td><td style="padding:13px 18px;font-size:14px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">${fullName}</td></tr>
    <tr style="border-bottom:1px solid rgba(212,175,55,0.1);"><td style="padding:13px 18px;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(212,175,55,0.7);font-family:Arial,sans-serif;font-weight:700;background:rgba(212,175,55,0.03);">Travel Date</td><td style="padding:13px 18px;font-size:14px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">${dateStr}</td></tr>
    <tr style="border-bottom:1px solid rgba(212,175,55,0.1);"><td style="padding:13px 18px;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(212,175,55,0.7);font-family:Arial,sans-serif;font-weight:700;background:rgba(212,175,55,0.03);">Travellers</td><td style="padding:13px 18px;font-size:14px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">${travellerStr}</td></tr>
    <tr style="border-bottom:1px solid rgba(212,175,55,0.1);"><td style="padding:13px 18px;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(212,175,55,0.7);font-family:Arial,sans-serif;font-weight:700;background:rgba(212,175,55,0.03);">Contact</td><td style="padding:13px 18px;font-size:14px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">${phone}</td></tr>
    <tr><td style="padding:13px 18px;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(212,175,55,0.7);font-family:Arial,sans-serif;font-weight:700;background:rgba(212,175,55,0.03);">Country</td><td style="padding:13px 18px;font-size:14px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">${country}</td></tr>
  </table>
</td></tr>
<tr><td style="padding:24px 40px 8px;">
  <div style="font-size:9px;letter-spacing:5px;text-transform:uppercase;color:#d4af37;font-family:Arial,sans-serif;font-weight:800;margin-bottom:16px;">Official Invoice</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(212,175,55,0.2);background:rgba(212,175,55,0.03);">
  <tr><td style="padding:22px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="vertical-align:top;">
          <div style="font-size:9px;letter-spacing:4px;text-transform:uppercase;color:rgba(212,175,55,0.6);font-family:Arial,sans-serif;font-weight:700;margin-bottom:4px;">Invoice To</div>
          <div style="font-size:15px;font-weight:800;color:#ffffff;font-family:Arial,sans-serif;">${fullName}</div>
          <div style="font-size:12px;color:#c8bfb0;font-family:Arial,sans-serif;margin-top:2px;">${email}</div>
          <div style="font-size:12px;color:#c8bfb0;font-family:Arial,sans-serif;">${country}</div>
        </td>
        <td style="vertical-align:top;text-align:right;">
          <div style="font-size:9px;letter-spacing:4px;text-transform:uppercase;color:rgba(212,175,55,0.6);font-family:Arial,sans-serif;font-weight:700;margin-bottom:4px;">Invoice Details</div>
          <div style="font-size:12px;font-weight:700;color:#c8bfb0;font-family:Arial,sans-serif;">Ref: <span style="color:#d4af37;">${ref_number}</span></div>
          <div style="font-size:12px;color:#c8bfb0;font-family:Arial,sans-serif;">Date: ${invoiceDate}</div>
          <div style="font-size:12px;font-weight:700;font-family:Arial,sans-serif;color:#7bb56e;">Status: Pending Confirmation</div>
        </td>
      </tr>
    </table>
    <div style="height:1px;background:rgba(212,175,55,0.15);margin:16px 0;"></div>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="font-size:13px;font-weight:700;color:#c8bfb0;font-family:Arial,sans-serif;padding:6px 0;">${package_name}</td>
        <td style="font-size:13px;font-weight:700;color:#c8bfb0;font-family:Arial,sans-serif;padding:6px 0;text-align:right;">${travellerStr}</td>
      </tr>
      <tr>
        <td style="font-size:11px;color:rgba(200,191,176,0.6);font-family:Arial,sans-serif;padding-bottom:12px;">Travel date: ${dateStr}</td>
        <td></td>
      </tr>
    </table>
    <div style="height:1px;background:rgba(212,175,55,0.15);margin-bottom:14px;"></div>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(212,175,55,0.8);font-family:Arial,sans-serif;font-weight:800;">Estimated Total</td>
        <td style="font-size:22px;font-weight:800;color:#d4af37;font-family:Georgia,serif;text-align:right;">${totalStr}</td>
      </tr>
    </table>
    <div style="font-size:10px;color:rgba(200,191,176,0.5);font-family:Arial,sans-serif;margin-top:10px;font-style:italic;">Final pricing confirmed by your concierge within 24 hours. A 30% deposit is required to secure your dates.</div>
  </td></tr>
  </table>
</td></tr>
<tr><td style="padding:24px 40px 8px;">
  <div style="font-size:9px;letter-spacing:5px;text-transform:uppercase;color:#d4af37;font-family:Arial,sans-serif;font-weight:800;margin-bottom:16px;">What Happens Next</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(212,175,55,0.15);background:rgba(212,175,55,0.03);">
    <tr style="border-bottom:1px solid rgba(212,175,55,0.08);"><td style="padding:16px 18px;width:40px;font-size:18px;">📋</td><td style="padding:16px 18px;"><div style="font-size:12px;font-weight:800;color:#ffffff;font-family:Arial,sans-serif;margin-bottom:3px;">Review</div><div style="font-size:12px;color:#c8bfb0;font-family:Arial,sans-serif;font-weight:600;">Your concierge reviews your request and checks availability within 24 hours.</div></td></tr>
    <tr style="border-bottom:1px solid rgba(212,175,55,0.08);"><td style="padding:16px 18px;font-size:18px;">💬</td><td style="padding:16px 18px;"><div style="font-size:12px;font-weight:800;color:#ffffff;font-family:Arial,sans-serif;margin-bottom:3px;">Personal Consultation</div><div style="font-size:12px;color:#c8bfb0;font-family:Arial,sans-serif;font-weight:600;">We contact you via email or WhatsApp to tailor the final itinerary to your needs.</div></td></tr>
    <tr><td style="padding:16px 18px;font-size:18px;">✈️</td><td style="padding:16px 18px;"><div style="font-size:12px;font-weight:800;color:#ffffff;font-family:Arial,sans-serif;margin-bottom:3px;">Confirmation &amp; Deposit</div><div style="font-size:12px;color:#c8bfb0;font-family:Arial,sans-serif;font-weight:600;">A 30% deposit secures your dates and your safari journey officially begins.</div></td></tr>
  </table>
</td></tr>
<tr><td align="center" style="padding:28px 40px 36px;">
  <a href="https://wa.me/34672304384?text=${waMsg}" style="display:inline-block;font-family:Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:#080808;background:linear-gradient(135deg,#f0c84a,#d4af37,#b8860b);padding:18px 48px;text-decoration:none;">CHAT WITH YOUR CONCIERGE</a>
</td></tr>
${message ? `<tr><td style="padding:0 40px 28px;"><div style="border:1px solid rgba(212,175,55,0.15);padding:20px 24px;"><div style="font-size:9px;letter-spacing:4px;text-transform:uppercase;color:rgba(212,175,55,0.6);font-family:Arial,sans-serif;font-weight:700;margin-bottom:10px;">Your Special Requests</div><div style="font-size:14px;color:#c8bfb0;font-family:Georgia,serif;font-style:italic;font-weight:600;line-height:1.8;">"${message}"</div></div></td></tr>` : ""}
<tr><td style="padding:0 40px;"><div style="height:1px;background:linear-gradient(to right,#080808,rgba(212,175,55,0.2),#080808);"></div></td></tr>
<tr><td align="center" style="padding:28px 40px 36px;">
  <div style="font-size:10px;letter-spacing:2px;color:#8a8074;font-family:Arial,sans-serif;font-weight:600;margin-bottom:6px;">Questions? <a href="mailto:hello@filmaxjambotours.com" style="color:#d4af37;text-decoration:none;">hello@filmaxjambotours.com</a></div>
  <div style="font-size:10px;letter-spacing:2px;color:#8a8074;font-family:Arial,sans-serif;font-weight:600;margin-bottom:8px;">&copy; 2025 Filmax Jambo Tours &middot; Nairobi, Kenya</div>
  <a href="https://filmaxjambotours.com" style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:rgba(212,175,55,0.6);text-decoration:none;font-family:Arial,sans-serif;font-weight:700;">filmaxjambotours.com</a>
</td></tr>
<tr><td style="height:3px;background:linear-gradient(to right,#080808,#d4af37,#080808);"></td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

    const adminHtml = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#080808;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:40px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#0d0d0d;border:1px solid rgba(212,175,55,0.3);">
<tr><td style="height:3px;background:linear-gradient(to right,#080808,#d4af37,#080808);"></td></tr>
<tr><td style="padding:32px 36px 16px;">
  <div style="font-size:10px;letter-spacing:5px;text-transform:uppercase;color:#d4af37;font-family:Arial,sans-serif;font-weight:700;margin-bottom:16px;">NEW RESERVATION — ACTION REQUIRED</div>
  <div style="font-size:26px;font-weight:800;color:#ffffff;font-family:Georgia,serif;margin-bottom:4px;">${fullName}</div>
  <div style="font-size:14px;color:#d4af37;font-family:Arial,sans-serif;font-weight:700;letter-spacing:2px;">${ref_number}</div>
</td></tr>
<tr><td style="padding:0 36px 28px;">
  <div style="height:1px;background:rgba(212,175,55,0.2);margin-bottom:20px;"></div>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:8px 0;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(212,175,55,0.7);font-family:Arial,sans-serif;font-weight:700;width:35%;vertical-align:top;">Package</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">${package_name}</td></tr>
    <tr><td style="padding:8px 0;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(212,175,55,0.7);font-family:Arial,sans-serif;font-weight:700;vertical-align:top;">Email</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">${email}</td></tr>
    <tr><td style="padding:8px 0;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(212,175,55,0.7);font-family:Arial,sans-serif;font-weight:700;vertical-align:top;">Phone</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">${phone}</td></tr>
    <tr><td style="padding:8px 0;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(212,175,55,0.7);font-family:Arial,sans-serif;font-weight:700;vertical-align:top;">Country</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">${country}</td></tr>
    <tr><td style="padding:8px 0;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(212,175,55,0.7);font-family:Arial,sans-serif;font-weight:700;vertical-align:top;">Travellers</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">${travellerStr}</td></tr>
    <tr><td style="padding:8px 0;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(212,175,55,0.7);font-family:Arial,sans-serif;font-weight:700;vertical-align:top;">Date</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">${dateStr}</td></tr>
    <tr><td style="padding:8px 0;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(212,175,55,0.7);font-family:Arial,sans-serif;font-weight:700;vertical-align:top;">How Heard</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">${how_heard || "—"}</td></tr>
    ${message ? `<tr><td style="padding:8px 0;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(212,175,55,0.7);font-family:Arial,sans-serif;font-weight:700;vertical-align:top;">Notes</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#c8bfb0;font-family:Georgia,serif;font-style:italic;">${message}</td></tr>` : ""}
  </table>
  <div style="margin-top:20px;">
    <a href="mailto:${email}?subject=Re: Your Filmax Jambo Tours Reservation — ${ref_number}" style="display:inline-block;font-family:Arial,sans-serif;font-size:10px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:#080808;background:linear-gradient(135deg,#f0c84a,#d4af37,#b8860b);padding:14px 28px;text-decoration:none;margin-right:10px;">REPLY TO GUEST</a>
    <a href="https://supabase.com/dashboard/project/kwriicxzkgkcseorcqdi/editor" style="display:inline-block;font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#d4af37;border:1px solid rgba(212,175,55,0.4);padding:14px 20px;text-decoration:none;">VIEW IN DASHBOARD</a>
  </div>
</td></tr>
<tr><td style="height:3px;background:linear-gradient(to right,#080808,#d4af37,#080808);"></td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

    const [guestRes, adminRes] = await Promise.all([
      fetch("https://api.resend.com/emails", {
        method:  "POST",
        headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from:    FROM_EMAIL,
          to:      [email],
          subject: `Your Safari Reservation is Confirmed — Ref: ${ref_number}`,
          html:    guestHtml,
        }),
      }),
      fetch("https://api.resend.com/emails", {
        method:  "POST",
        headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from:    FROM_EMAIL,
          to:      [TO_ADMIN],
          subject: `New Reservation: ${fullName} — ${package_name} — ${ref_number}`,
          html:    adminHtml,
        }),
      }),
    ]);

    const guestJson = await guestRes.json();
    const adminJson = await adminRes.json();

    return new Response(JSON.stringify({ success: true, guest: guestJson, admin: adminJson }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      status: 200,
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      status: 500,
    });
  }
});
