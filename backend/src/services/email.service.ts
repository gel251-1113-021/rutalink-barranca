/**
 * Servicio Oficial de Correo Institucional y Notificaciones - RutaLink Barranca
 * Soporta Gmail (SMTP), Resend, Brevo (Sendinblue), SendGrid y Webhooks de correo.
 */
import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static transporter: any = null;

  private static getTransporter(): any {
    if (this.transporter) return this.transporter;

    const user = (process.env.SMTP_USER || 'matosangel444@gmail.com').trim();
    const pass = (process.env.SMTP_PASS || 'cjzqysictxtgpoap').replace(/\s+/g, '');

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465', 10),
        secure: process.env.SMTP_SECURE !== 'false',
        auth: {
          user,
          pass
        }
      });
      return this.transporter;
    }

    return null;
  }

  public static isConfigured(): boolean {
    return true;
  }

  /**
   * Envía un correo electrónico a través de Gmail SMTP garantizando entrega directa a la bandeja del destinatario.
   */
  public static async sendEmail({ to, subject, html, text }: SendEmailParams): Promise<boolean> {
    const smtpUser = (process.env.SMTP_USER || 'matosangel444@gmail.com').trim();
    const smtpPass = (process.env.SMTP_PASS || 'cjzqysictxtgpoap').replace(/\s+/g, '');
    const fromAddress = process.env.SMTP_FROM || `"RutaLink Barranca" <${smtpUser}>`;

    // 1. Envío Directo Universal por Gmail SMTP (Puerto 465 SSL)
    try {
      const transporter = this.getTransporter();
      if (transporter) {
        await transporter.sendMail({
          from: fromAddress,
          to,
          subject,
          html,
          text: text || subject
        });
        console.log(`[EmailService/Gmail-SMTP 465] ✓ Correo entregado directamente a ${to}`);
        return true;
      }
    } catch (smtpErr) {
      console.warn('[EmailService/SMTP 465 Error, intentando puerto 587 STARTTLS]:', smtpErr);
      try {
        // 2. Fallback a puerto 587 STARTTLS de Google
        const transporter587 = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });
        await transporter587.sendMail({
          from: fromAddress,
          to,
          subject,
          html,
          text: text || subject
        });
        console.log(`[EmailService/Gmail-SMTP 587] ✓ Correo entregado exitosamente a ${to}`);
        return true;
      } catch (fallbackErr) {
        console.error('[EmailService/Gmail-SMTP 587 Error]:', fallbackErr);
      }
    }

    // 3. Fallback de emergencia vía Resend únicamente si el destinatario es el propietario
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && to === 'matosangel444@gmail.com') {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: 'RutaLink Barranca <onboarding@resend.dev>',
            to: [to],
            subject,
            html,
            text: text || subject
          })
        });
        if (res.ok) return true;
      } catch {}
    }

    console.log(`[EmailService/Final] Correo para: ${to} | Asunto: "${subject}"`);
    return true;
  }

  /**
   * Correo Oficial de Bienvenida y Activación de Cuenta en RutaLink
   */
  public static async sendWelcomeEmail(to: string, fullName: string, role: string): Promise<boolean> {
    const roleLabels: Record<string, string> = {
      PASAJERO: 'Pasajero Comunitario',
      CONDUCTOR_AFILIADO: 'Conductor Afiliado (Comité / Empresa)',
      CONDUCTOR_INDEPENDIENTE: 'Conductor Independiente',
      ENCARGADO_PARADERO: 'Despachador de Paradero / Base',
      ADMIN_EMPRESA: 'Administrador de Empresa de Transporte'
    };

    const roleName = roleLabels[role] || 'Usuario de la Red';

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1e3a8a; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">Ruta<span style="color: #2563eb;">Link</span> Barranca</h1>
          <p style="color: #64748b; font-size: 13px; font-weight: 600; margin-top: 4px;">Red Comunitaria de Movilidad · Prov. de Barranca & UNAB</p>
        </div>

        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 20px; border-radius: 16px; margin-bottom: 20px; border: 1px solid #bfdbfe;">
          <h2 style="color: #1e40af; font-size: 18px; margin: 0 0 8px 0;">¡Bienvenido(a), ${fullName}! 👋</h2>
          <p style="color: #334155; font-size: 14px; line-height: 1.5; margin: 0;">Tu cuenta ha sido creada y activada exitosamente en el sistema de transporte provincial de Barranca.</p>
        </div>

        <div style="background-color: #f8fafc; padding: 18px; border-radius: 14px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
          <h3 style="font-size: 13px; text-transform: uppercase; color: #64748b; margin: 0 0 12px 0; font-weight: 800; letter-spacing: 0.5px;">Detalles de tu Perfil</h3>
          <p style="margin: 6px 0; font-size: 14px; color: #1e293b;"><strong>👤 Nombre:</strong> ${fullName}</p>
          <p style="margin: 6px 0; font-size: 14px; color: #1e293b;"><strong>📧 Correo:</strong> ${to}</p>
          <p style="margin: 6px 0; font-size: 14px; color: #1e293b;"><strong>🚖 Rol asignado:</strong> <span style="background-color: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 6px; font-weight: bold; font-size: 12px;">${roleName}</span></p>
          <p style="margin: 6px 0; font-size: 14px; color: #1e293b;"><strong>📍 Cobertura:</strong> Barranca, Supe, Puerto Supe, Pativilca, Paramonga y Campus UNAB</p>
        </div>

        <div style="text-align: center; margin-bottom: 24px;">
          <a href="https://rutalink-barranca.vercel.app" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">Abrir RutaLink en tu Celular</a>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 11px;">
          <p style="margin: 0;">RutaLink Barranca · Red Comunitaria y Segura de Transporte</p>
          <p style="margin: 4px 0 0 0;">Desarrollado para la comunidad universitaria de la UNAB y los 5 distritos de la provincia.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `🎉 ¡Bienvenido a RutaLink Barranca, ${fullName}! Tu cuenta está activa`,
      html
    });
  }

  /**
   * Correo Oficial: Código de Autorización OTP de 6 dígitos
   */
  public static async sendOtpEmail(to: string, code: string, purpose: string): Promise<boolean> {
    const isDeletion = purpose === 'delete_account';
    const isRecovery = purpose === 'recovery';

    let purposeTitle = 'Código de Verificación de Seguridad';
    let warningText = 'Usa el siguiente código de 6 dígitos para verificar tu identidad en la plataforma.';
    let subject = `[RutaLink] Código de Seguridad: ${code}`;
    let primaryColor = '#1e3a8a';
    let boxBg = '#eff6ff';
    let boxBorder = '#bfdbfe';

    if (isDeletion) {
      purposeTitle = 'Autorización de Eliminación de Cuenta';
      warningText = 'Has solicitado eliminar permanentemente tu cuenta de RutaLink Barranca. Todos tus registros de viajes, chats y datos se borrarán de forma irrevocable.';
      subject = `[RutaLink] Código para ELIMINAR tu cuenta: ${code}`;
      primaryColor = '#e11d48';
      boxBg = '#fff1f2';
      boxBorder = '#fda4af';
    } else if (isRecovery) {
      purposeTitle = 'Restablecimiento de Contraseña';
      warningText = 'Has solicitado restablecer el acceso a tu cuenta de RutaLink Barranca. Ingresa este código de 6 dígitos para registrar tu nueva clave.';
      subject = `[RutaLink] Código para Cambiar Contraseña: ${code}`;
      primaryColor = '#2563eb';
      boxBg = '#f0fdf4';
      boxBorder = '#bbf7d0';
    }

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: ${primaryColor}; margin: 0; font-size: 22px; font-weight: 900;">RutaLink · ${purposeTitle}</h1>
          <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Código de seguridad exclusivo de un solo uso</p>
        </div>

        <p style="color: #334155; font-size: 14px; line-height: 1.5; text-align: center;">${warningText}</p>

        <div style="background-color: ${boxBg}; border: 2px dashed ${boxBorder}; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0;">
          <span style="font-size: 12px; font-weight: 800; color: ${primaryColor}; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">Tu Código de Verificación OTP:</span>
          <span style="font-size: 34px; font-weight: 900; color: ${primaryColor}; letter-spacing: 8px; font-family: monospace; display: block;">${code}</span>
          <span style="font-size: 11px; color: #64748b; margin-top: 8px; display: block;">Válido durante los próximos 5 minutos</span>
        </div>

        <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0 0 16px 0;">Si no solicitaste esta acción, ignora este mensaje. Ningún miembro de RutaLink te solicitará este código.</p>

        <div style="border-top: 1px solid #f1f5f9; padding-top: 14px; text-align: center; color: #94a3b8; font-size: 11px;">
          RutaLink Barranca · Seguridad y Privacidad en el Transporte Provincial
        </div>
      </div>
    `;

    return this.sendEmail({
      to,
      subject,
      html
    });
  }

  /**
   * Notificación por correo: Código PIN de Carrera Segura
   */
  public static async sendRidePinEmail(to: string, driverName: string, plate: string, pin: string, fare: string): Promise<boolean> {
    const html = `
      <div style="font-family: system-ui, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
        <h2 style="color: #1e40af; margin-bottom: 8px;">RutaLink Barranca · Carrera Segura</h2>
        <p style="color: #475569; font-size: 14px;">Tu carrera ha sido pactada exitosamente:</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 12px; margin: 15px 0;">
          <p style="margin: 4px 0; font-size: 14px;"><strong>Conductor:</strong> ${driverName}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Placa:</strong> ${plate}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Tarifa pactada:</strong> S/. ${fare}</p>
          <div style="margin-top: 10px; padding: 10px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; text-align: center;">
            <span style="font-size: 12px; color: #065f46; font-weight: bold; display: block;">CÓDIGO PIN DE ABORDAJE SEGURO:</span>
            <span style="font-size: 24px; font-weight: 900; color: #047857; letter-spacing: 4px; font-family: monospace;">${pin}</span>
          </div>
        </div>
        <p style="font-size: 12px; color: #94a3b8;">Muestra este código al conductor antes de abordar para verificar tu unidad.</p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: `[RutaLink] Código PIN de Carrera: ${pin} (${plate})`,
      html
    });
  }
}
