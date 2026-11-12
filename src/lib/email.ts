import "server-only";
import { Resend } from "resend";
import { fullAddress, site } from "@/lib/site";
import { formatLongDate, formatTime } from "@/lib/time";

interface BookingEmailData {
  reference: string;
  treatmentName: string;
  startsAt: Date;
  fullName: string;
  email: string;
  whatsapp: string;
  message: string | null;
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(title: string, body: string) {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#F8F6F2;font-family:Helvetica,Arial,sans-serif;color:#302A26">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px"><tr><td align="center">
  <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #E3D9CE">
  <tr><td style="padding:40px 40px 8px;font-family:Georgia,serif;font-size:13px;letter-spacing:4px;color:#69564B">CH · ${escapeHtml(site.name.toUpperCase())}</td></tr>
  <tr><td style="padding:8px 40px 0;font-family:Georgia,serif;font-size:28px;line-height:1.2;color:#3C302A">${title}</td></tr>
  <tr><td style="padding:24px 40px 40px;font-size:15px;line-height:1.6">${body}</td></tr>
  </table>
  <p style="font-size:12px;color:#8D8279;margin-top:24px">${escapeHtml(fullAddress)} · ${escapeHtml(site.instagram.handle)}</p>
  </td></tr></table></body></html>`;
}

function detailsTable(b: BookingEmailData) {
  const row = (k: string, v: string) =>
    `<tr><td style="padding:10px 0;border-bottom:1px solid #EFEAE2;color:#8D8279;width:40%">${k}</td><td style="padding:10px 0;border-bottom:1px solid #EFEAE2">${escapeHtml(v)}</td></tr>`;
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0">${[
    row("Referencia", b.reference),
    row("Tratamiento", b.treatmentName),
    row("Fecha", formatLongDate(b.startsAt)),
    row("Hora", formatTime(b.startsAt)),
    row("Nombre", b.fullName),
    row("WhatsApp", b.whatsapp),
  ].join("")}</table>`;
}

/** Envía el acuse a la clienta y el aviso al centro. Devuelve true si el correo a la clienta salió. */
export async function sendBookingEmails(booking: BookingEmailData): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM!;

  const customer = await resend.emails.send({
    from,
    to: booking.email,
    subject: `Hemos recibido tu solicitud de cita · ${booking.reference}`,
    html: layout(
      "Hemos recibido tu solicitud.",
      `<p>Hola ${escapeHtml(booking.fullName.split(" ")[0])},</p>
       <p>Gracias por elegirnos. Tu solicitud de cita quedó registrada y está <strong>pendiente de confirmación</strong>. El equipo la revisará y te contactará por WhatsApp o correo para confirmarla.</p>
       ${detailsTable(booking)}
       <p style="color:#8D8279;font-size:13px">Si necesitas cambiar o cancelar tu solicitud, escríbenos por WhatsApp indicando tu número de referencia.</p>`,
    ),
  });

  const notify = process.env.CLINIC_NOTIFICATION_EMAIL;
  if (notify) {
    await resend.emails
      .send({
        from,
        to: notify,
        replyTo: booking.email,
        subject: `Nueva solicitud de cita · ${booking.reference}`,
        html: layout(
          "Nueva solicitud de cita",
          `${detailsTable(booking)}<p><strong>Correo:</strong> ${escapeHtml(booking.email)}</p>${
            booking.message ? `<p><strong>Mensaje:</strong><br>${escapeHtml(booking.message)}</p>` : ""
          }<p>Gestiona la solicitud desde el panel de administración.</p>`,
        ),
      })
      .catch((e: unknown) => console.error("[email] aviso al centro:", e));
  }

  if (customer.error) {
    console.error("[email] acuse a la clienta:", customer.error);
    return false;
  }
  return true;
}
