import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ClientRoleUpdater } from './ClientRoleUpdater';
import { CrmManager } from './CrmManager';
import { EditClientModal } from './EditClientModal';

interface Props {
  params: { id: string };
}

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'text-yellow-400 bg-yellow-400/10' },
  CONFIRMED: { label: 'Confirmado', color: 'text-blue-400 bg-blue-400/10' },
  SHIPPED: { label: 'Enviado', color: 'text-purple-400 bg-purple-400/10' },
  DELIVERED: { label: 'Entregado', color: 'text-green-400 bg-green-400/10' },
  CANCELLED: { label: 'Cancelado', color: 'text-red-400 bg-red-400/10' },
};

export default async function ClientDetailPage({ params }: Props) {
  const client = await prisma.user.findUnique({
    where: { id: params.id },
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
      createdAt: true,
      orders: {
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!client) notFound();

  const totalSpent = client.orders.reduce((acc, o) => acc + o.total, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/clients" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-3">
          <ArrowLeft size={15} /> Volver a clientes
        </Link>
        <h1 className="text-2xl font-bold text-white">
          {client.name ?? 'Sin nombre'}
        </h1>
        <p className="text-gray-400 text-sm mt-1">{client.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Orders history */}
        <div className="md:col-span-2">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{client.orders.length}</p>
              <p className="text-xs text-gray-500 mt-1">Pedidos</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{formatPrice(totalSpent)}</p>
              <p className="text-xs text-gray-500 mt-1">Total gastado</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">
                {client.orders.length > 0 ? formatPrice(totalSpent / client.orders.length) : '$0'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Ticket promedio</p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800">
              <h2 className="font-semibold text-white">Historial de pedidos</h2>
            </div>
            <div className="divide-y divide-gray-800">
              {client.orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Sin pedidos aún
                </div>
              ) : (
                client.orders.map((order) => {
                  const s = statusConfig[order.status] ?? { label: order.status, color: 'text-gray-400 bg-gray-400/10' };
                  return (
                    <div key={order.id} className="flex items-center justify-between px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-white">
                          #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('es-AR')} · {order.items.length} ítem(s)
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-white text-sm">{formatPrice(order.total)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>
                          {s.label}
                        </span>
                        <Link href={`/dashboard/orders/${order.id}`} className="text-amber-400 hover:text-amber-300 text-xs transition-colors">
                          Ver →
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Client info & role updater */}
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Datos del cliente</h2>
              <EditClientModal client={client} />
            </div>
            <div className="space-y-2 text-sm">
              {client.company && (
                <div>
                  <p className="text-xs text-gray-500">Empresa</p>
                  <p className="text-white">{client.company}</p>
                </div>
              )}
              {client.location && (
                <div>
                  <p className="text-xs text-gray-500">Ubicación</p>
                  <p className="text-white">{client.location}</p>
                </div>
              )}
              {client.phone && (
                <div>
                  <p className="text-xs text-gray-500">Teléfono</p>
                  <p className="text-white">{client.phone}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">Registrado</p>
                <p className="text-white">
                  {new Date(client.createdAt).toLocaleDateString('es-AR')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
            <h2 className="font-semibold text-white">Rol comercial</h2>
            <ClientRoleUpdater
              clientId={client.id}
              currentRole={client.clientRole}
            />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
            <h2 className="font-semibold text-white flex items-center gap-2">
              Gestión de CRM
            </h2>
            <CrmManager
              clientId={client.id}
              initialLeadStatus={client.leadStatus}
              initialNextContactAt={client.nextContactAt}
              initialNotes={client.notes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
