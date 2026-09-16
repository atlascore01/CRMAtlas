'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Building2, 
  Clock, 
  ArrowUpRight, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface Client {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  industry: string | null;
  leadStatus: string | null;
  priorityLevel: string | null;
  nextContactAt: Date | string | null;
  createdAt: Date | string;
}

interface Props {
  initialClients: Client[];
}

export function ClientsManagerView({ initialClients }: Props) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal State for New Client
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Client State
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeletingClient, setIsDeletingClient] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    setIsDeletingClient(true);
    setDeleteError('');

    try {
      const res = await fetch(`/api/clients/${clientToDelete.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Error al eliminar cliente');
      }

      setClients((prev) => prev.filter((c) => c.id !== clientToDelete.id));
      setClientToDelete(null);
      router.refresh();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'No se pudo eliminar el cliente.');
    } finally {
      setIsDeletingClient(false);
    }
  };

  // Extract unique industries from clients
  const availableIndustries = Array.from(
    new Set(initialClients.map((c) => c.industry).filter(Boolean))
  ) as string[];

  // Filter clients
  const filteredClients = clients.filter((c) => {
    const matchesSearch = 
      (c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (c.company?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesIndustry = selectedIndustry === 'ALL' || c.industry === selectedIndustry;
    const matchesPriority = selectedPriority === 'ALL' || c.priorityLevel === selectedPriority;
    const matchesStatus = selectedStatus === 'ALL' || c.leadStatus === selectedStatus;

    return matchesSearch && matchesIndustry && matchesPriority && matchesStatus;
  });

  // Handle New Client submission
  const handleCreateClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name'),
      company: formData.get('company'),
      industry: formData.get('industry') || null,
      email: formData.get('email') ? String(formData.get('email')).trim() : null,
      phone: formData.get('phone'),
      location: formData.get('location'),
      leadStatus: formData.get('leadStatus') || 'NUEVO',
      priorityLevel: formData.get('priorityLevel') || 'MEDIA',
      nextContactAt: formData.get('nextContactAt') || null,
      notes: formData.get('notes'),
    };

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Error al registrar cliente');
      }

      const created = await res.json();
      setClients([created, ...clients]);
      setIsModalOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar el cliente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-brand font-bold text-[#F0EBD8] tracking-wide">
              Directorio de Clientes
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#023A40] border border-[#8BD990]/30 text-xs font-mono text-[#8BD990]">
              {filteredClients.length}
            </span>
          </div>
          <p className="text-xs text-[#909CC2] mt-1 font-light">
            Evolución comercial, seguimiento de leads y gestión por rubros.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="atlas-gradient-btn px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider font-brand flex items-center justify-center gap-2 shadow-lg cursor-pointer"
        >
          <Plus size={16} />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="atlas-card p-4 rounded-2xl border border-[#909CC2]/15 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#909CC2]" size={16} />
            <input
              type="text"
              placeholder="Buscar por nombre, empresa o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#001412]/80 border border-[#023A40] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F0EBD8] placeholder-[#909CC2]/50 focus:outline-none focus:border-[#8BD990]"
            />
          </div>

          {/* Industry Filter */}
          <div>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full bg-[#001412]/80 border border-[#023A40] rounded-xl px-3 py-2 text-xs text-[#F0EBD8] focus:outline-none focus:border-[#8BD990]"
            >
              <option value="ALL">Todos los Rubros</option>
              {availableIndustries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full bg-[#001412]/80 border border-[#023A40] rounded-xl px-3 py-2 text-xs text-[#F0EBD8] focus:outline-none focus:border-[#8BD990]"
            >
              <option value="ALL">Todas las Prioridades</option>
              <option value="ALTA">Prioridad Alta</option>
              <option value="MEDIA">Prioridad Media</option>
              <option value="BAJA">Prioridad Baja</option>
            </select>
          </div>

          {/* Funnel Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#001412]/80 border border-[#023A40] rounded-xl px-3 py-2 text-xs text-[#F0EBD8] focus:outline-none focus:border-[#8BD990]"
            >
              <option value="ALL">Todos los Estados (Funnel)</option>
              <option value="NUEVO">Nuevo</option>
              <option value="CONTACTADO">Contactado</option>
              <option value="RESPONDIO">Respondió</option>
              <option value="PIDIO_INFO">Pidió Info</option>
              <option value="COTIZACION">En Cotización</option>
              <option value="VENTA">Venta Concretada</option>
              <option value="PERDIDO">Perdido</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Table / Cards View */}
      <div className="atlas-card rounded-2xl border border-[#909CC2]/15 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#001412]/80 border-b border-[#909CC2]/15 text-[11px] font-brand uppercase tracking-wider text-[#909CC2]">
                <th className="p-4 pl-6">Cliente / Empresa</th>
                <th className="p-4">Rubro</th>
                <th className="p-4">Prioridad</th>
                <th className="p-4">Etapa Funnel</th>
                <th className="p-4">Próx. Contacto</th>
                <th className="p-4 pr-6 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#909CC2]/10 text-xs">
              {filteredClients.map((client) => {
                const priorityColors = 
                  client.priorityLevel === 'ALTA'
                    ? 'bg-red-950/50 border-red-500/40 text-red-300'
                    : client.priorityLevel === 'MEDIA'
                    ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                    : 'bg-[#023A40] border-[#8BD990]/30 text-[#8BD990]';

                const statusBg =
                  client.leadStatus === 'VENTA'
                    ? 'bg-[#8BD990]/20 text-[#8BD990] border-[#8BD990]/40'
                    : client.leadStatus === 'COTIZACION'
                    ? 'bg-[#4B4BA1]/30 text-[#909CC2] border-[#4B4BA1]/50'
                    : 'bg-[#001412] text-[#F0EBD8] border-[#023A40]';

                return (
                  <tr
                    key={client.id}
                    className="hover:bg-[#023A40]/30 transition-colors group"
                  >
                    {/* Name & Company */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#023A40] border border-[#909CC2]/20 flex items-center justify-center font-brand font-semibold text-[#8BD990] text-xs shrink-0 group-hover:border-[#8BD990]/50 transition-colors">
                          {client.name?.slice(0, 2).toUpperCase() || 'CL'}
                        </div>
                        <div>
                          <div className="font-semibold text-[#F0EBD8] text-sm">
                            {client.name || 'Sin Nombre'}
                          </div>
                          <div className="text-[11px] text-[#909CC2] flex items-center gap-2">
                            <span>{client.company || 'Sin Empresa'}</span>
                            {client.phone && <span>· {client.phone}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Industry */}
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#001412]/80 border border-[#023A40] text-[11px] text-[#F0EBD8]">
                        <Building2 size={12} className="text-[#8BD990]" />
                        <span>{client.industry || 'General'}</span>
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-brand tracking-wider uppercase border ${priorityColors}`}>
                        {client.priorityLevel || 'MEDIA'}
                      </span>
                    </td>

                    {/* Status Funnel */}
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] border font-mono ${statusBg}`}>
                        {client.leadStatus || 'NUEVO'}
                      </span>
                    </td>

                    {/* Next Contact */}
                    <td className="p-4">
                      {client.nextContactAt ? (
                        <div className="text-[11px] text-[#8BD990] font-mono flex items-center gap-1">
                          <Clock size={12} />
                          <span>{new Date(client.nextContactAt).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-[#909CC2]/40 text-xs">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#023A40] hover:bg-[#8BD990] text-[#8BD990] hover:text-[#001412] text-xs font-brand tracking-wider uppercase font-semibold transition-all"
                        >
                          <span>Gestionar</span>
                          <ArrowUpRight size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setClientToDelete(client)}
                          className="p-1.5 rounded-lg text-[#909CC2]/60 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-500/30 transition-all cursor-pointer"
                          title="Eliminar cliente o lead"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#909CC2]">
                    <div className="max-w-xs mx-auto space-y-3">
                      <AlertCircle className="mx-auto text-[#909CC2]/40" size={36} />
                      <p className="text-sm font-medium text-[#F0EBD8]">
                        No se encontraron clientes
                      </p>
                      <p className="text-xs text-[#909CC2]/60 font-light">
                        Prueba ajustando los filtros de búsqueda o registra un nuevo cliente en el botón superior.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: + Nuevo Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001412]/80 backdrop-blur-sm animate-fadeIn">
          <div className="atlas-card w-full max-w-xl rounded-2xl border border-[#8BD990]/30 shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#909CC2]/15 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#8BD990]/20 border border-[#8BD990]/40 flex items-center justify-center text-[#8BD990]">
                  <Plus size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-brand font-bold text-[#F0EBD8]">
                    Registrar Nuevo Cliente / Lead
                  </h2>
                  <p className="text-xs text-[#909CC2]">
                    Ingresa los datos para incorporarlo al pipeline comercial de Atlascore.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#909CC2] hover:text-white hover:bg-[#023A40]"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-brand uppercase tracking-wider text-[#909CC2]">
                    Nombre y Apellido *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-[#001412] border border-[#023A40] rounded-xl px-3 py-2 text-xs text-[#F0EBD8] focus:outline-none focus:border-[#8BD990]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-brand uppercase tracking-wider text-[#909CC2]">
                    Empresa / Organización
                  </label>
                  <input
                    type="text"
                    name="company"
                    placeholder="Ej. Logística Global"
                    className="w-full bg-[#001412] border border-[#023A40] rounded-xl px-3 py-2 text-xs text-[#F0EBD8] focus:outline-none focus:border-[#8BD990]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-brand uppercase tracking-wider text-[#909CC2]">
                    Rubro / Industria
                  </label>
                  <input
                    type="text"
                    name="industry"
                    placeholder="Ej. Consultoría, Software, Mecánica"
                    className="w-full bg-[#001412] border border-[#023A40] rounded-xl px-3 py-2 text-xs text-[#F0EBD8] focus:outline-none focus:border-[#8BD990]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-brand uppercase tracking-wider text-[#909CC2]">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Ej. +54 9 11 1234-5678"
                    className="w-full bg-[#001412] border border-[#023A40] rounded-xl px-3 py-2 text-xs text-[#F0EBD8] focus:outline-none focus:border-[#8BD990]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-brand uppercase tracking-wider text-[#909CC2]">
                    Email de Contacto
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="contacto@empresa.com"
                    className="w-full bg-[#001412] border border-[#023A40] rounded-xl px-3 py-2 text-xs text-[#F0EBD8] focus:outline-none focus:border-[#8BD990]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-brand uppercase tracking-wider text-[#909CC2]">
                    Ubicación / Ciudad
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="Ej. Córdoba / Buenos Aires"
                    className="w-full bg-[#001412] border border-[#023A40] rounded-xl px-3 py-2 text-xs text-[#F0EBD8] focus:outline-none focus:border-[#8BD990]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-brand uppercase tracking-wider text-[#909CC2]">
                    Estado Inicial del Funnel
                  </label>
                  <select
                    name="leadStatus"
                    defaultValue="NUEVO"
                    className="w-full bg-[#001412] border border-[#023A40] rounded-xl px-3 py-2 text-xs text-[#F0EBD8] focus:outline-none focus:border-[#8BD990]"
                  >
                    <option value="NUEVO">Nuevo Lead</option>
                    <option value="CONTACTADO">Contactado</option>
                    <option value="RESPONDIO">Respondió</option>
                    <option value="PIDIO_INFO">Pidió Información</option>
                    <option value="COTIZACION">Enviada Cotización</option>
                    <option value="VENTA">Venta Concretada</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-brand uppercase tracking-wider text-[#909CC2]">
                    Nivel de Prioridad
                  </label>
                  <select
                    name="priorityLevel"
                    defaultValue="MEDIA"
                    className="w-full bg-[#001412] border border-[#023A40] rounded-xl px-3 py-2 text-xs text-[#F0EBD8] focus:outline-none focus:border-[#8BD990]"
                  >
                    <option value="ALTA">Alta (Gran Interés)</option>
                    <option value="MEDIA">Media (Estándar)</option>
                    <option value="BAJA">Baja (Exploratoria)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-brand uppercase tracking-wider text-[#909CC2]">
                  Agendar Próximo Contacto
                </label>
                <input
                  type="datetime-local"
                  name="nextContactAt"
                  className="w-full bg-[#001412] border border-[#023A40] rounded-xl px-3 py-2 text-xs text-[#F0EBD8] focus:outline-none focus:border-[#8BD990] [color-scheme:dark]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-brand uppercase tracking-wider text-[#909CC2]">
                  Notas y Requerimientos Iniciales
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Detalles del requerimiento o interés del cliente..."
                  className="w-full bg-[#001412] border border-[#023A40] rounded-xl px-3 py-2 text-xs text-[#F0EBD8] focus:outline-none focus:border-[#8BD990]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#909CC2]/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#909CC2] hover:text-white hover:bg-[#023A40]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="atlas-gradient-btn px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider font-brand flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Guardar Cliente</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Eliminación de Cliente */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001412]/85 backdrop-blur-md animate-fadeIn">
          <div className="atlas-card w-full max-w-md rounded-2xl border border-red-500/40 shadow-2xl p-6 relative">
            <div className="flex items-start justify-between pb-3 border-b border-[#909CC2]/15 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="text-base font-brand font-bold text-[#F0EBD8]">
                    ¿Eliminar Cliente o Lead?
                  </h3>
                  <p className="text-xs text-[#909CC2]">
                    Esta acción es definitiva e irreversible.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isDeletingClient && setClientToDelete(null)}
                className="p-1 rounded-lg text-[#909CC2] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {deleteError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs">
                {deleteError}
              </div>
            )}

            <p className="text-xs sm:text-sm text-[#F0EBD8]/90 leading-relaxed mb-6 font-light">
              Estás por eliminar permanentemente a <strong className="text-white font-semibold font-brand">{clientToDelete.name || 'este cliente'}</strong> ({clientToDelete.company || 'Sin Empresa'}). Se borrarán todos sus registros comerciales y notas asociadas.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#909CC2]/10">
              <button
                type="button"
                disabled={isDeletingClient}
                onClick={() => setClientToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-brand text-[#909CC2] hover:text-white hover:bg-[#023A40] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeletingClient}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-brand font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeletingClient ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    <span>Confirmar Eliminación</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

