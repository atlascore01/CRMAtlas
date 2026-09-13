import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Users, Calendar } from 'lucide-react';
import { NewClientModal } from './NewClientModal';

interface Props {
  searchParams: { search?: string; clientRole?: string; page?: string };
}

const roleConfig: Record<string, { label: string; color: string }> = {
  CLIENTE_FINAL: { label: 'Cliente Final', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  TALLER_PRO: { label: 'Taller Pro', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  DISTRIBUIDOR: { label: 'Distribuidor', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
};

const leadStatusConfig: Record<string, { label: string; color: string }> = {
  NUEVO: { label: 'Nuevo', color: 'text-gray-400 bg-gray-400/10 border-gray-400/20' },
  CONTACTADO: { label: 'Contactado', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  RESPONDIO: { label: 'Respondió', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
  PIDIO_INFO: { label: 'Pidió Info', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  COTIZACION: { label: 'Cotización', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  VENTA: { label: 'Venta', color: 'text-green-400 bg-green-400/10 border-green-400/20' },
};

export default async function ClientsPage({ searchParams }: Props) {
  const search = searchParams.search ?? '';
  const clientRole = searchParams.clientRole;
  const leadStatus = searchParams.leadStatus;
  const page = parseInt(searchParams.page ?? '1', 10);
  const limit = 20;
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

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes & Leads</h1>
          <p className="text-gray-400 text-sm mt-1">{total} contacto(s) registrado(s)</p>
        </div>
        <NewClientModal />
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-3 flex-wrap">
        <input
          name="search"
          defaultValue={search}
          placeholder="Buscar por nombre, email o empresa..."
          className="flex-1 min-w-[200px] bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 placeholder-gray-500 focus:outline-none focus:border-amber-500"
        />
        <select
          name="clientRole"
          defaultValue={clientRole}
          className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
        >
          <option value="">Todos los roles</option>
          {Object.entries(roleConfig).map(([value, { label }]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          name="leadStatus"
          defaultValue={leadStatus}
          className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
        >
          <option value="">Cualquier Estado (CRM)</option>
          {Object.entries(leadStatusConfig).map(([value, { label }]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          Filtrar
        </button>
      </form>

      {/* Clients table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Cliente', 'Empresa', 'Rol / Estado', 'Próx. Contacto', 'Pedidos', 'Registrado', 'Acciones'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {clients.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    <Users size={32} className="mx-auto mb-2 opacity-30" />
                    No se encontraron clientes
                  </td>
                </tr>
              )}
              {clients.map((client) => {
                const role = roleConfig[client.clientRole] ?? { label: client.clientRole, color: 'text-gray-400 bg-gray-400/10 border-gray-400/20' };
                const leadStatusItem = client.leadStatus ? (leadStatusConfig[client.leadStatus] ?? { label: client.leadStatus, color: 'text-gray-400 bg-gray-400/10 border-gray-400/20' }) : null;
                
                return (
                  <tr key={client.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-white">{client.name ?? 'Sin nombre'}</p>
                      <p className="text-xs text-gray-500">{client.email || 'Sin email'}</p>
                      {client.phone && <p className="text-xs text-gray-500">{client.phone}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400">
                      {client.company ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 space-y-1.5">
                      <span className={`flex w-fit items-center px-2 py-0.5 rounded-full text-xs font-medium border ${role.color}`}>
                        {role.label}
                      </span>
                      {leadStatusItem && (
                        <span className={`flex w-fit items-center px-2 py-0.5 rounded-full text-xs font-medium border ${leadStatusItem.color}`}>
                          {leadStatusItem.label}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {client.nextContactAt ? (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Calendar size={14} className="text-amber-500" />
                          {new Date(client.nextContactAt).toLocaleDateString('es-AR')}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400">
                      {client._count.orders}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {new Date(client.createdAt).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors"
                      >
                        Ver ficha →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-800">
            <p className="text-sm text-gray-500">Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`?search=${search}&page=${page - 1}`} className="px-3 py-1.5 bg-gray-800 text-sm text-white rounded-lg hover:bg-gray-700 transition-colors">
                  Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link href={`?search=${search}&page=${page + 1}`} className="px-3 py-1.5 bg-amber-500 text-sm text-gray-900 font-medium rounded-lg hover:bg-amber-400 transition-colors">
                  Siguiente
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
