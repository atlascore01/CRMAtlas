import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { CrmManager } from './CrmManager';

export const dynamic = 'force-dynamic';

export default async function ClientDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> | { id: string } 
}) {
  const resolvedParams = await Promise.resolve(params);
  const client = await prisma.user.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!client) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Navigation and Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-2 text-xs font-brand uppercase tracking-wider text-[#909CC2] hover:text-[#8BD990] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Volver al Directorio</span>
        </Link>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#023A40] border border-[#8BD990]/30 text-xs font-brand text-[#8BD990]">
          <Sparkles size={13} />
          <span>Gestión CRM Activa</span>
        </div>
      </div>

      {/* Unified Horizontal Contact Card */}
      <div className="atlas-card rounded-2xl p-6 border border-[#909CC2]/20 shadow-xl space-y-5">
        {/* Header with Avatar, Name & Registration Date */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#909CC2]/15 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8BD990] to-[#4B4BA1] flex items-center justify-center font-brand font-bold text-[#001412] text-xl shadow-lg shrink-0">
              {client.name?.slice(0, 2).toUpperCase() || 'CL'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-brand font-bold text-[#F0EBD8]">
                  {client.name || 'Sin Nombre Registrado'}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#023A40] border border-[#8BD990]/30 text-[#8BD990] font-brand uppercase font-medium">
                  {client.industry || 'Rubro General'}
                </span>
              </div>
              <p className="text-sm text-[#909CC2] mt-0.5 font-light">
                {client.company || 'Empresa no especificada'}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right sm:border-l sm:border-[#909CC2]/15 sm:pl-6 shrink-0">
            <span className="text-[10px] font-brand uppercase tracking-wider text-[#909CC2]">
              Registrado el
            </span>
            <div className="text-xs font-mono text-[#F0EBD8] mt-0.5">
              {new Date(client.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>

        {/* Horizontal Quick Info Bar (5 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-1 text-xs">
          {/* Empresa */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#001412]/70 border border-[#023A40]">
            <div className="w-8 h-8 rounded-lg bg-[#023A40]/80 flex items-center justify-center text-[#8BD990] shrink-0">
              <Building2 size={15} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-brand uppercase text-[#909CC2]">Empresa</div>
              <div className="font-medium text-[#F0EBD8] truncate">
                {client.company || 'No especificada'}
              </div>
            </div>
          </div>

          {/* Rubro */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#001412]/70 border border-[#023A40]">
            <div className="w-8 h-8 rounded-lg bg-[#023A40]/80 flex items-center justify-center text-[#8BD990] shrink-0">
              <Briefcase size={15} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-brand uppercase text-[#909CC2]">Rubro / Industria</div>
              <div className="font-medium text-[#F0EBD8] truncate">
                {client.industry || 'No especificado'}
              </div>
            </div>
          </div>

          {/* Correo Electrónico */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#001412]/70 border border-[#023A40]">
            <div className="w-8 h-8 rounded-lg bg-[#023A40]/80 flex items-center justify-center text-[#8BD990] shrink-0">
              <Mail size={15} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-brand uppercase text-[#909CC2]">Correo Electrónico</div>
              <div className="font-medium text-[#F0EBD8] truncate">
                {client.email ? (
                  <a href={`mailto:${client.email}`} className="text-[#8BD990] hover:underline">
                    {client.email}
                  </a>
                ) : (
                  'No especificado'
                )}
              </div>
            </div>
          </div>

          {/* Teléfono / WhatsApp */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#001412]/70 border border-[#023A40]">
            <div className="w-8 h-8 rounded-lg bg-[#023A40]/80 flex items-center justify-center text-[#8BD990] shrink-0">
              <Phone size={15} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-brand uppercase text-[#909CC2]">Teléfono / WhatsApp</div>
              <div className="font-medium text-[#F0EBD8] truncate">
                {client.phone ? (
                  <a href={`tel:${client.phone}`} className="text-[#8BD990] hover:underline">
                    {client.phone}
                  </a>
                ) : (
                  'No especificado'
                )}
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#001412]/70 border border-[#023A40]">
            <div className="w-8 h-8 rounded-lg bg-[#023A40]/80 flex items-center justify-center text-[#8BD990] shrink-0">
              <MapPin size={15} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-brand uppercase text-[#909CC2]">Ubicación</div>
              <div className="font-medium text-[#F0EBD8] truncate">
                {client.location || 'No especificada'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Full-Width Section: Gestión del Embudo & Seguimiento */}
      <div className="w-full">
        <CrmManager 
          clientId={client.id}
          initialLeadStatus={client.leadStatus}
          initialPriorityLevel={client.priorityLevel}
          initialNextContactAt={client.nextContactAt}
          initialNotes={client.notes}
        />
      </div>
    </div>
  );
}
