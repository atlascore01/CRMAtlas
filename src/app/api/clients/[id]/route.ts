import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function isAdmin(_req: NextRequest) {
  const _session = await getServerSession(authOptions);
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
    const updateData: Record<string, unknown> = {};
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

// DELETE /api/clients/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Eliminar cuentas y sesiones asociadas si existieran
    await prisma.account.deleteMany({ where: { userId: id } });
    await prisma.session.deleteMany({ where: { userId: id } });

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Cliente o Lead eliminado con éxito' });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: 'Error al eliminar el cliente de la base de datos' }, { status: 500 });
  }
}

