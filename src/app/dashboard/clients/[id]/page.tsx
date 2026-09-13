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

      {/* Hero Header Card */}
      <div className="atlas-card rounded-2xl p-6 border border-[#909CC2]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8BD990] to-[#4B4BA1] flex items-center justify-center font-brand font-bold text-[#001412] text-xl shadow-lg">
            {client.name?.slice(0, 2).toUpperCase() || 'CL'}
          </div>
          <div>
            <h1 className="text-2xl font-brand font-bold text-[#F0EBD8]">
              {client.name || 'Sin Nombre Registrado'}
            </h1>
            <p className="text-sm text-[#909CC2] flex items-center gap-2 mt-0.5">
              <span>{client.company || 'Sin Empresa'}</span>
              <span>·</span>
              <span className="text-[#8BD990]">{client.industry || 'Rubro General'}</span>
            </p>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-[#909CC2]/15 sm:pl-6">
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

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Client Contact Information */}
        <div className="lg:col-span-1 space-y-6">
          <div className="atlas-card p-6 rounded-2xl border border-[#909CC2]/15 space-y-5">
            <h3 className="text-sm font-brand font-semibold text-[#F0EBD8] uppercase tracking-wider border-b border-[#909CC2]/15 pb-3">
              Ficha del Contacto
            </h3>

            <dl className="space-y-4 text-xs">
              <div className="space-y-1">
                <dt className="text-[#909CC2] flex items-center gap-2">
                  <Building2 size={14} className="text-[#8BD990]" />
                  <span>Empresa</span>
                </dt>
                <dd className="font-medium text-[#F0EBD8] pl-6 text-sm">
                  {client.company || 'No especificada'}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-[#909CC2] flex items-center gap-2">
                  <Briefcase size={14} className="text-[#8BD990]" />
                  <span>Rubro / Industria</span>
                </dt>
                <dd className="font-medium text-[#F0EBD8] pl-6 text-sm">
                  {client.industry || 'No especificado'}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-[#909CC2] flex items-center gap-2">
                  <Mail size={14} className="text-[#8BD990]" />
                  <span>Correo Electrónico</span>
                </dt>
                <dd className="font-medium text-[#F0EBD8] pl-6 text-sm break-all">
                  {client.email ? (
                    <a href={`mailto:${client.email}`} className="text-[#8BD990] hover:underline">
                      {client.email}
                    </a>
                  ) : (
                    'No especificado'
                  )}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-[#909CC2] flex items-center gap-2">
                  <Phone size={14} className="text-[#8BD990]" />
                  <span>Teléfono / WhatsApp</span>
                </dt>
                <dd className="font-medium text-[#F0EBD8] pl-6 text-sm">
                  {client.phone ? (
                    <a href={`tel:${client.phone}`} className="text-[#8BD990] hover:underline">
                      {client.phone}
                    </a>
                  ) : (
                    'No especificado'
                  )}
                </dd>
              </div>

              <div className="space-y-1">
                <dt className="text-[#909CC2] flex items-center gap-2">
                  <MapPin size={14} className="text-[#8BD990]" />
                  <span>Ubicación</span>
                </dt>
                <dd className="font-medium text-[#F0EBD8] pl-6 text-sm">
                  {client.location || 'No especificada'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right Column: CRM Manager */}
        <div className="lg:col-span-2">
          <CrmManager 
            clientId={client.id}
            initialLeadStatus={client.leadStatus}
            initialPriorityLevel={client.priorityLevel}
            initialNextContactAt={client.nextContactAt}
            initialNotes={client.notes}
          />
        </div>
      </div>
    </div>
  );
}
