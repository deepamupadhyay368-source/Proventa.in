import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/services/notifications';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, email, company, industry, revenue, priority } = await request.json();

    if (!name || !email || !company || !industry || !revenue) {
      return NextResponse.json({ error: 'Missing required onboarding parameters' }, { status: 400 });
    }

    // Check if email already registered in waitlist
    const existing = await db.waitlist.findUnique({
      where: { email }
    });

    if (existing) {
      return NextResponse.json({ 
        success: true, 
        position: existing.position, 
        priority: existing.priority,
        message: 'Email already registered.'
      });
    }

    // Count existing to get placement position
    const currentCount = await db.waitlist.count();
    const waitlistOffset = 1248; // starting offset to feel premium
    const position = waitlistOffset + currentCount + 1;

    // Save Waitlist Submission
    const entry = await db.waitlist.create({
      data: {
        name,
        email,
        company,
        industry,
        revenue: parseFloat(revenue),
        priority,
        position
      }
    });

    // Send Premium Confirmation Email
    await sendEmail(
      email,
      'Proventa Private Beta Onboarding Priority Confirmed',
      `
      <div style="font-family: sans-serif; color: #1E293B; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; padding: 30px;">
        <h2 style="color: #0B1F3A; margin-top: 0;">PROVENTA</h2>
        <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 20px 0;" />
        <p>Hello <strong>${name}</strong>,</p>
        <p>We are pleased to confirm your priority access spot on the Proventa Private Beta onboarding registry.</p>
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
          <span style="font-size: 0.75rem; text-transform: uppercase; color: #64748B; font-weight: 700; letter-spacing: 0.05em; display: block; margin-bottom: 5px;">Your Waitlist Position</span>
          <span style="font-size: 2.2rem; font-weight: 800; color: #2563EB; font-family: monospace;">#${position}</span>
          <span style="font-size: 0.8rem; color: #10B981; display: block; font-weight: 700; margin-top: 5px;">${priority.toUpperCase()} ACCESS TIER VERIFIED</span>
        </div>
        <p>Proventa underwrites and automates credit intelligence pipelines for enterprise leaders. We onboard batches weekly to preserve service excellence.</p>
        <p>Our product team will notify you as soon as your access slot opens.</p>
        <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 25px 0;" />
        <span style="font-size: 0.75rem; color: #64748B;">🛡️ Secured by Proventa Zero-Trust</span>
      </div>
      `
    );

    return NextResponse.json({
      success: true,
      position,
      priority: entry.priority
    });
  } catch (err: any) {
    console.error('Waitlist API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
