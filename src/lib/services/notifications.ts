import { Resend } from 'resend';
import twilio from 'twilio';

// Initialize Resend Email Client
const resendApiKey = process.env.RESEND_API_KEY;
let resend: Resend | null = null;
if (resendApiKey) {
  resend = new Resend(resendApiKey);
}

// Initialize Twilio Client
const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;
let twilioClient: any = null;
if (twilioSid && twilioToken) {
  twilioClient = twilio(twilioSid, twilioToken);
}

// 1. Sends premium transactional emails
export async function sendEmail(to: string, subject: string, htmlBody: string): Promise<boolean> {
  if (resend) {
    try {
      const response = await resend.emails.send({
        from: 'Proventa Security <security@proventa.in>',
        to,
        subject,
        html: htmlBody
      });
      return !response.error;
    } catch (err) {
      console.warn('[PROVENTA EMAIL ERROR]: Resend failed. Falling back to log print.', err);
    }
  }

  // Developer Simulation Console Log
  console.log('====================================');
  console.log(`[PROVENTA EMAIL SIMULATOR]`);
  console.log(`TO:      ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`BODY:    ${htmlBody.replace(/<[^>]*>/g, '').substring(0, 150)}...`);
  console.log('====================================');
  return true;
}

// 2. Sends SMS alerts using Twilio
export async function sendSms(to: string, message: string): Promise<boolean> {
  const fromPhone = process.env.TWILIO_PHONE_NUMBER || '+1234567890';
  if (twilioClient) {
    try {
      await twilioClient.messages.create({
        body: message,
        from: fromPhone,
        to
      });
      return true;
    } catch (err) {
      console.warn('[PROVENTA SMS ERROR]: Twilio send failed. Falling back to log print.', err);
    }
  }

  // Developer Simulation Console Log
  console.log('====================================');
  console.log(`[PROVENTA SMS SIMULATOR]`);
  console.log(`TO:      ${to}`);
  console.log(`FROM:    ${fromPhone}`);
  console.log(`MESSAGE: ${message}`);
  console.log('====================================');
  return true;
}

// 3. Sends WhatsApp alerts using Twilio Sandbox
export async function sendWhatsApp(to: string, message: string): Promise<boolean> {
  const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
  const targetWhatsApp = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

  if (twilioClient) {
    try {
      await twilioClient.messages.create({
        body: message,
        from: fromWhatsApp,
        to: targetWhatsApp
      });
      return true;
    } catch (err) {
      console.warn('[PROVENTA WHATSAPP ERROR]: Twilio send failed. Falling back to log print.', err);
    }
  }

  // Developer Simulation Console Log
  console.log('====================================');
  console.log(`[PROVENTA WHATSAPP SIMULATOR]`);
  console.log(`TO:      ${targetWhatsApp}`);
  console.log(`FROM:    ${fromWhatsApp}`);
  console.log(`MESSAGE: ${message}`);
  console.log('====================================');
  return true;
}
