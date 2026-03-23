// Placeholder email service — logs to console in dev
// In production, replace with Resend/SendGrid/etc.

export async function sendWelcomeEmail(email: string, name: string) {
  console.log(`[Email Service] Welcome email would be sent to ${email} (${name})`);
  // TODO: Integrate with Resend/SendGrid
  // const html = getWelcomeTemplate(name);
  // await resend.emails.send({ from: "Mirqolyzer <hello@mirqolyzer.com>", to: email, subject: "Bienvenido a Mirqolyzer", html });
}

export function getWelcomeTemplate(name: string): string {
  return `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1e3a5f; font-size: 28px; margin: 0;">
          <span style="font-weight: 700;">Mirqo</span><span style="font-weight: 300;">lyzer</span>
        </h1>
      </div>
      <h2 style="color: #1e3a5f;">¡Bienvenido, ${name}!</h2>
      <p style="color: #555; line-height: 1.6;">
        Tu cuenta ha sido creada exitosamente. Ya puedes empezar a analizar tus facturas y recibos.
      </p>
      <div style="margin: 30px 0;">
        <h3 style="color: #1e3a5f;">Primeros pasos:</h3>
        <ol style="color: #555; line-height: 2;">
          <li>Sube tu primera factura o comprobante</li>
          <li>El sistema extraerá los datos automáticamente</li>
          <li>Revisa, edita y exporta tus datos</li>
        </ol>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://mirqolyzer.com/dashboard" style="background: #1e3a5f; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Ir al Panel
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #999; font-size: 12px; text-align: center;">
        © 2026 Mirqolyzer. Todos los derechos reservados.
      </p>
    </div>
  `;
}
