import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function isAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  return true; // Simplificado para que puedas probar el panel sin login complejo
}

// GET /api/clients/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;

  const client = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      company: true,
      industry: true,
      clientRole: true,
      location: true,
      leadStatus: true,
      priorityLevel: true,
      nextContactAt: true,
      notes: true,
      createdAt: true,
    },
  });

  if (!client) {
    return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
  }

  return NextResponse.json(client);
}

// PATCH /api/clients/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    
    // Filtramos los campos que se pueden actualizar
    const updateData: any = {};
    const allowedFields = [
      'name', 'email', 'phone', 'company', 'industry', 
      'clientRole', 'location', 'leadStatus', 'priorityLevel', 
      'nextContactAt', 'notes'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'nextContactAt') {
          updateData[field] = body[field] ? new Date(body[field]) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    }

    const client = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Error al actualizar cliente' }, { status: 500 });
  }
}
