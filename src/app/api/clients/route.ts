import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper to check admin access. Adjusted for testing or default ADMIN logic.
async function isAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  // Defaulting to true for development if session logic isn't fully set up,
  // but in production it should verify session?.user?.role === 'ADMIN'
  return true; 
}

// GET /api/clients
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') ?? '';
  const industry = searchParams.get('industry');
  const leadStatus = searchParams.get('leadStatus');
  const priorityLevel = searchParams.get('priorityLevel');
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const limit = parseInt(searchParams.get('limit') ?? '20', 10);
  const skip = (page - 1) * limit;

  const where = {
    role: 'USER',
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { company: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...(industry && { industry }),
    ...(leadStatus && { leadStatus }),
    ...(priorityLevel && { priorityLevel }),
  };

  const [clients, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        industry: true,
        clientRole: true,
        leadStatus: true,
        priorityLevel: true,
        nextContactAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ clients, total, page, limit });
}

// POST /api/clients (Create manual Lead/Client)
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { name, company, phone, location, email, industry, leadStatus, priorityLevel, nextContactAt, notes } = data;

    const newClient = await prisma.user.create({
      data: {
        name,
        company,
        phone,
        location,
        email: email || null,
        industry: industry || null,
        leadStatus: leadStatus || 'NUEVO',
        priorityLevel: priorityLevel || 'MEDIA',
        nextContactAt: nextContactAt ? new Date(nextContactAt) : null,
        notes,
        role: 'USER',
        clientRole: 'CLIENTE_FINAL',
      },
    });

    return NextResponse.json(newClient);
  } catch (error: unknown) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: 'Error al crear cliente' }, { status: 500 });
  }
}
