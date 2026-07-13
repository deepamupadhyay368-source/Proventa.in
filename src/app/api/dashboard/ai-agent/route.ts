import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let config = await db.aiAgentConfig.findUnique({
      where: { organizationId: session.organizationId }
    });

    if (!config) {
      config = await db.aiAgentConfig.create({
        data: {
          organizationId: session.organizationId,
          agentName: 'Proventa Copilot',
          systemPrompt: 'You are an expert AI Chartered Accountant assisting a business owner.',
          allowedModules: 'portfolio,customers,invoices',
          creditPolicy: '',
          isActive: true
        }
      });
    }

    return NextResponse.json(config);
  } catch (error: any) {
    console.error('AI Agent config fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const config = await db.aiAgentConfig.upsert({
      where: { organizationId: session.organizationId },
      update: {
        agentName: data.agentName,
        systemPrompt: data.systemPrompt,
        allowedModules: data.allowedModules,
        creditPolicy: data.creditPolicy,
        isActive: data.isActive
      },
      create: {
        organizationId: session.organizationId,
        agentName: data.agentName || 'Proventa Copilot',
        systemPrompt: data.systemPrompt || '',
        allowedModules: data.allowedModules || '',
        creditPolicy: data.creditPolicy || '',
        isActive: data.isActive ?? true
      }
    });

    return NextResponse.json(config);
  } catch (error: any) {
    console.error('AI Agent config update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
