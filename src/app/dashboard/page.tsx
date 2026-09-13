import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Flame, 
  Calendar, 
  ArrowUpRight, 
  Building2, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Briefcase
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardOverviewPage() {
  const clients = await prisma.user.findMany({
    where: { role: 'USER' },
    orderBy: { createdAt: 'desc' },
  });

  const totalClients = clients.length;
  const highPriority = clients.filter((c) => c.priorityLevel === 'ALTA').length;
  const inQuotation = clients.filter((c) => c.leadStatus === 'COTIZACION').length;
  const closedSales = clients.filter((c) => c.leadStatus === 'VENTA').length;

  // Funnel counts
  const funnelStages = [
    { label: 'Nuevos', key: 'NUEVO', count: clients.filter((c) => c.leadStatus === 'NUEVO').length, color: 'from-[#8BD990] to-[#55C3A5]' },
    { label: 'Contactados', key: 'CONTACTADO', count: clients.filter((c) => c.leadStatus === 'CONTACTADO').length, color: 'from-[#55C3A5] to-[#459FA5]' },
    { label: 'Respondieron', key: 'RESPONDIO', count: clients.filter((c) => c.leadStatus === 'RESPONDIO').length, color: 'from-[#459FA5] to-[#4B79A1]' },
    { label: 'Pidieron Info', key: 'PIDIO_INFO', count: clients.filter((c) => c.leadStatus === 'PIDIO_INFO').length, color: 'from-[#4B79A1] to-[#4B5CA1]' },
    { label: 'En Cotización', key: 'COTIZACION', count: inQuotation, color: 'from-[#4B5CA1] to-[#4B4BA1]' },
    { label: 'Venta Cerrada', key: 'VENTA', count: closedSales, color: 'from-[#8BD990] to-[#8BD990]' },
  ];

  // Upcoming scheduled contacts
  const upcomingContacts = clients
    .filter((c) => c.nextContactAt)
    .sort((a, b) => new Date(a.nextContactAt!).getTime() - new Date(b.nextContactAt!).getTime())
    .slice(0, 4);

  // Industry breakdown
  const industriesMap: { [key: string]: number } = {};
  clients.forEach((c) => {
    const ind = c.industry || 'Sin Clasificar';
    industriesMap[ind] = (industriesMap[ind] || 0) + 1;
  });
  const topIndustries = Object.entries(industriesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Brand Hero Welcome Banner */}
      <div className="atlas-card rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-[#909CC2]/20 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#8BD990]/10 via-[#4B4BA1]/10 to-transparent rounded-bl-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#023A40] border border-[#8BD990]/30 text-xs text-[#8BD990] font-brand tracking-wider uppercase">
              <Sparkles size={13} />
              <span>Atlascore Core Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-brand font-bold text-[#F0EBD8] tracking-wide">
              Panel de Evolución & Clientes
            </h1>
            <p className="text-sm text-[#909CC2] leading-relaxed font-light">
              Impulsando la evolución digital y el crecimiento exponencial a medida de cada cliente. Gestiona tu pipeline comercial y monitoreo estratégico.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/clients"
              className="px-4 py-2.5 rounded-xl atlas-gradient-btn text-xs font-semibold uppercase tracking-wider font-brand flex items-center gap-2"
            >
              <Users size={16} />
              <span>Directorio de Clientes</span>
            </Link>
          </div>
        </div>

        {/* Feature Badges from Brand Manual (p. 11, 15) */}
        <div className="mt-6 pt-5 border-t border-[#909CC2]/15 flex flex-wrap gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-[#001412]/70 border border-[#023A40] text-[#909CC2] font-brand text-[11px]">
            Consultoría Tecnológica
          </span>
          <span className="px-2.5 py-1 rounded-md bg-[#001412]/70 border border-[#023A40] text-[#909CC2] font-brand text-[11px]">
            Automatización con IA
          </span>
          <span className="px-2.5 py-1 rounded-md bg-[#001412]/70 border border-[#023A40] text-[#909CC2] font-brand text-[11px]">
            Desarrollo a Medida
          </span>
          <span className="px-2.5 py-1 rounded-md bg-[#001412]/70 border border-[#023A40] text-[#8BD990] font-brand text-[11px]">
            Powered by Code
          </span>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Clients */}
        <div className="atlas-card p-5 rounded-2xl border border-[#909CC2]/15 relative group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-brand uppercase tracking-wider text-[#909CC2]">
              Total Contactos
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#8BD990]/10 border border-[#8BD990]/30 flex items-center justify-center text-[#8BD990]">
              <Users size={18} />
            </div>
          </div>
          <div className="text-3xl font-brand font-bold text-[#F0EBD8] mb-1">
            {totalClients}
          </div>
          <p className="text-xs text-[#909CC2]">Leads registrados en CRM</p>
        </div>

        {/* High Priority */}
        <div className="atlas-card p-5 rounded-2xl border border-[#909CC2]/15 relative group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-brand uppercase tracking-wider text-[#909CC2]">
              Prioridad Alta
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Flame size={18} />
            </div>
          </div>
          <div className="text-3xl font-brand font-bold text-[#F0EBD8] mb-1">
            {highPriority}
          </div>
          <p className="text-xs text-red-400/80">Cierre inminente o alto interés</p>
        </div>

        {/* In Quotation */}
        <div className="atlas-card p-5 rounded-2xl border border-[#909CC2]/15 relative group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-brand uppercase tracking-wider text-[#909CC2]">
              Cotizaciones
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#4B4BA1]/20 border border-[#4B4BA1]/40 flex items-center justify-center text-[#909CC2]">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-3xl font-brand font-bold text-[#F0EBD8] mb-1">
            {inQuotation}
          </div>
          <p className="text-xs text-[#909CC2]">Propuestas en evaluación</p>
        </div>

        {/* Closed Sales */}
        <div className="atlas-card p-5 rounded-2xl border border-[#909CC2]/15 relative group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-brand uppercase tracking-wider text-[#909CC2]">
              Ventas Concretadas
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#8BD990]/20 border border-[#8BD990]/40 flex items-center justify-center text-[#8BD990]">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="text-3xl font-brand font-bold text-[#8BD990] mb-1">
            {closedSales}
          </div>
          <p className="text-xs text-[#8BD990]/80">Clientes con cierre exitoso</p>
        </div>
      </div>

      {/* Funnel Pipeline Visual Tracker */}
      <div className="atlas-card rounded-2xl p-6 border border-[#909CC2]/15 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-brand font-semibold text-[#F0EBD8]">
              Embudo Comercial de Conversión (Funnel)
            </h2>
            <p className="text-xs text-[#909CC2]">Flujo y avance por etapas comerciales</p>
          </div>
          <span className="text-xs font-mono text-[#8BD990] bg-[#001412] px-3 py-1 rounded-full border border-[#8BD990]/20">
            {totalClients} Contactos totales
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {funnelStages.map((stage, idx) => {
            const percentage = totalClients > 0 ? Math.round((stage.count / totalClients) * 100) : 0;
            return (
              <div
                key={stage.key}
                className="bg-[#001412]/80 border border-[#023A40] rounded-xl p-4 flex flex-col justify-between hover:border-[#8BD990]/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-[#909CC2]/60">0{idx + 1}</span>
                    <span className="text-[11px] font-mono text-[#8BD990]">{percentage}%</span>
                  </div>
                  <h3 className="text-xs font-brand uppercase tracking-wider text-[#909CC2] group-hover:text-[#F0EBD8] transition-colors">
                    {stage.label}
                  </h3>
                </div>
                <div className="mt-3">
                  <div className="text-xl font-brand font-bold text-[#F0EBD8]">
                    {stage.count}
                  </div>
                  {/* Visual mini bar */}
                  <div className="w-full bg-[#023A40] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${stage.color}`}
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Upcoming Contacts & Top Industries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Scheduled Contacts */}
        <div className="lg:col-span-2 atlas-card rounded-2xl p-6 border border-[#909CC2]/15">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <Calendar className="text-[#8BD990]" size={18} />
              <h2 className="text-base font-brand font-semibold text-[#F0EBD8]">
                Agenda de Próximos Contactos
              </h2>
            </div>
            <Link
              href="/dashboard/clients"
              className="text-xs text-[#8BD990] hover:underline flex items-center gap-1 font-brand"
            >
              <span>Ver todos</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {upcomingContacts.length > 0 ? (
            <div className="space-y-3">
              {upcomingContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-[#001412]/60 border border-[#023A40] hover:border-[#8BD990]/30 transition-all gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#023A40] border border-[#909CC2]/20 flex items-center justify-center font-brand font-semibold text-[#8BD990] text-xs">
                      {contact.name?.slice(0, 2).toUpperCase() || 'CL'}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-[#F0EBD8]">
                        {contact.name || 'Sin Nombre'}
                      </h4>
                      <p className="text-xs text-[#909CC2]">
                        {contact.company || 'Sin Empresa'} · {contact.industry || 'General'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-xs font-mono text-[#8BD990] flex items-center gap-1">
                        <Clock size={12} />
                        <span>{new Date(contact.nextContactAt!).toLocaleDateString()}</span>
                      </div>
                      <span className="text-[10px] text-[#909CC2]">
                        {new Date(contact.nextContactAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <Link
                      href={`/dashboard/clients/${contact.id}`}
                      className="p-2 rounded-lg bg-[#023A40] hover:bg-[#8BD990] text-[#8BD990] hover:text-[#001412] transition-colors"
                      title="Gestionar en CRM"
                    >
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-[#909CC2]/70 text-sm">
              <Calendar className="mx-auto mb-2 text-[#909CC2]/40" size={32} />
              <p>No hay contactos agendados próximamente.</p>
              <p className="text-xs mt-1 text-[#909CC2]/50">
                Define fechas de seguimiento desde la ficha del cliente.
              </p>
            </div>
          )}
        </div>

        {/* Industry Distribution */}
        <div className="atlas-card rounded-2xl p-6 border border-[#909CC2]/15">
          <div className="flex items-center gap-2.5 mb-5">
            <Building2 className="text-[#8BD990]" size={18} />
            <h2 className="text-base font-brand font-semibold text-[#F0EBD8]">
              Distribución por Rubro
            </h2>
          </div>

          {topIndustries.length > 0 ? (
            <div className="space-y-4">
              {topIndustries.map(([industry, count]) => {
                const percent = Math.round((count / (totalClients || 1)) * 100);
                return (
                  <div key={industry} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#F0EBD8] font-medium">{industry}</span>
                      <span className="text-[#909CC2] font-mono">{count} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-[#001412] h-2 rounded-full overflow-hidden border border-[#023A40]">
                      <div
                        className="h-full bg-gradient-to-r from-[#8BD990] to-[#4B4BA1] rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-[#909CC2]/70 text-sm">
              <Briefcase className="mx-auto mb-2 text-[#909CC2]/40" size={32} />
              <p>Sin datos de rubro aún.</p>
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-[#909CC2]/10 text-center">
            <Link
              href="/dashboard/clients"
              className="text-xs text-[#8BD990] hover:underline font-brand uppercase tracking-wider"
            >
              Ver clientes por rubro →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
