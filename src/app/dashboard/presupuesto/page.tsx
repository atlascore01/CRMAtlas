import React from 'react';
import Link from 'next/link';
import { ExternalLink, Sparkles, FileSpreadsheet, Printer, Download } from 'lucide-react';

export const metadata = {
  title: 'Armado de Presupuestos | Atlascore CRM',
};

export default function PresupuestoDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hero Bar */}
      <div className="atlas-card rounded-2xl p-6 sm:p-7 border border-[#909CC2]/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-[#8BD990]/10 via-[#4B4BA1]/10 to-transparent rounded-bl-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#023A40] border border-[#8BD990]/30 text-xs text-[#8BD990] font-brand tracking-wider uppercase">
              <Sparkles size={13} />
              <span>Cotizador & Template Interactivo</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-brand font-bold text-[#F0EBD8] tracking-wide flex items-center gap-3">
              <FileSpreadsheet className="text-[#8BD990]" size={28} />
              Armado de Presupuestos IT
            </h1>
            <p className="text-sm text-[#909CC2] font-light leading-relaxed">
              Genera propuestas comerciales personalizadas para Hardware, Software y Servicios IT con cálculo de subtotales en tiempo real, selección de moneda (USD/ARS/EUR), IVA y exportación lista para imprimir o guardar en PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/templates/presupuesto-atlas.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl atlas-gradient-btn text-xs font-semibold uppercase tracking-wider font-brand flex items-center gap-2 shadow-lg"
            >
              <span>Abrir en Pantalla Completa</span>
              <ExternalLink size={15} />
            </a>
          </div>
        </div>
      </div>

      {/* Embedded Builder Iframe Container */}
      <div className="atlas-card rounded-2xl border border-[#909CC2]/20 overflow-hidden shadow-2xl bg-[#081014]">
        <iframe
          src="/templates/presupuesto-atlas.html"
          className="w-full h-[calc(100vh-250px)] min-h-[780px] border-0"
          title="Generador de Presupuestos Atlascore"
        />
      </div>
    </div>
  );
}
