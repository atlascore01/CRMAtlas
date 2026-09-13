import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function isAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'ADMIN';
}

// GET /api/admin/clients
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') ?? '';
  const clientRole = searchParams.get('clientRole');
  const leadStatus = searchParams.get('leadStatus');
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
    ...(clientRole && { clientRole }),
    ...(leadStatus && { leadStatus }),
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
        clientRole: true,
        leadStatus: true,
        nextContactAt: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ clients, total, page, limit });
}

// POST /api/admin/clients (Create manual Lead/Client)
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { name, company, phone, location, email, leadStatus, nextContactAt, notes } = data;

    const newClient = await prisma.user.create({
      data: {
        name,
        company,
        phone,
        location,
        email: email || null,
        leadStatus: leadStatus || 'CONTACTADO',
        nextContactAt: nextContactAt ? new Date(nextContactAt) : null,
        notes,
        role: 'USER',
        clientRole: 'TALLER_PRO', // Default for leads typically
      },
    });

    return NextResponse.json(newClient);
  } catch (error: any) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: 'Error al crear cliente' }, { status: 500 });
  }
}

