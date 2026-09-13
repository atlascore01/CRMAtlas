import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

async function isAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'ADMIN';
}

// GET /api/admin/clients/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const client = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      company: true,
      clientRole: true,
      createdAt: true,
      orders: {
        include: { items: { include: { product: { select: { name: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!client) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
  }

  return NextResponse.json(client);
}

const updateClientSchema = z.object({
  name: z.string().min(2).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  clientRole: z
    .enum(['CLIENTE_FINAL', 'TALLER_PRO', 'DISTRIBUIDOR'])
    .optional(),
  location: z.string().optional().nullable(),
  leadStatus: z.string().optional().nullable(),
  nextContactAt: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// PATCH /api/admin/clients/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateClientSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos inválidos', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const client = await prisma.user.update({
    where: { id: params.id },
    data: parsed.data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      company: true,
      clientRole: true,
      location: true,
      leadStatus: true,
      nextContactAt: true,
      notes: true,
    },
  });

  return NextResponse.json(client);
}
