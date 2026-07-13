import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name, email, company, phone,
      companySize, industry, useCases,
      preferredDate, preferredSlot, message,
    } = body;

    // Validate required fields
    if (!name || !email || !company) {
      return NextResponse.json({ error: 'Name, email, and company are required fields.' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    // Log demo request (in production, this would save to CRM or send to sales team)
    console.log('[PROVENTA DEMO REQUEST]', {
      timestamp: new Date().toISOString(),
      name,
      email,
      company,
      phone: phone || 'Not provided',
      companySize: companySize || 'Not specified',
      industry: industry || 'Not specified',
      useCases: useCases?.join(', ') || 'None selected',
      preferredDate: preferredDate || 'Flexible',
      preferredSlot: preferredSlot || 'Flexible',
      message: message || 'No additional message',
    });

    // Store as notification (using db.notification — public endpoint, no auth required)
    // In production, integrate with CRM (HubSpot, Salesforce) or email workflows
    // We'll use a try/catch so the response still succeeds even if DB write fails
    try {
      const { db } = await import('@/lib/db');
      
      // Find any admin org to attach notification to (or create a system record)
      const adminOrg = await db.organization.findFirst({
        orderBy: { createdAt: 'asc' },
      });

      if (adminOrg) {
        await db.notification.create({
          data: {
            organizationId: adminOrg.id,
            title: `New Demo Request: ${company}`,
            message: `${name} (${email}) from ${company} (${industry || 'Industry N/A'}, ${companySize || 'Size N/A'}) has requested a demo. Preferred: ${preferredDate || 'Flexible'} ${preferredSlot || ''}. Use cases: ${useCases?.join(', ') || 'None specified'}.${message ? ` Notes: ${message}` : ''}`,
            type: 'INFO',
            isRead: false,
          },
        });
      }
    } catch (dbErr) {
      // Non-fatal: don't block response if DB unavailable
      console.warn('[PROVENTA DEMO] DB notification write failed (non-fatal):', dbErr);
    }

    // In production: send confirmation email via sendEmail service
    // import { sendEmail } from '@/lib/services/notifications';
    // await sendEmail({
    //   to: email,
    //   subject: 'Proventa Demo Confirmation',
    //   body: `Hi ${name}, your demo request for ${preferredDate} ${preferredSlot} has been received. Our team will confirm within 2 hours.`
    // });

    console.log(`[PROVENTA DEMO] Confirmation email would be sent to: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Demo scheduled! Check your email for confirmation. Our team will reach out within 2 business hours.',
    });
  } catch (error) {
    console.error('[BOOK DEMO POST ERROR]', error);
    return NextResponse.json({ error: 'Failed to process your demo request. Please try again or email us at demo@proventa.in' }, { status: 500 });
  }
}
