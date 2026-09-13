'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Save, Calendar, FileText, Layers } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ClientNotesTimeline } from '@/components/ClientNotesTimeline';

interface Props {
  clientId: string;
  initialLeadStatus: string | null;
  initialPriorityLevel: string | null;
  initialNextContactAt: Date | null;
  initialNotes: string | null;
}

export function CrmManager({ 
  clientId, 
  initialLeadStatus, 
  initialPriorityLevel, 
  initialNextContactAt, 
  initialNotes 
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [notesValue, setNotesValue] = useState<string>(initialNotes || '');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      leadStatus: formData.get('leadStatus'),
      priorityLevel: formData.get('priorityLevel'),
      nextContactAt: formData.get('nextContactAt') || null,
      notes: notesValue,
    };

    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Error al actualizar CRM');
      
      setFeedback({ type: 'success', message: '¡Datos de CRM y seguimiento guardados con éxito!' });
      router.refresh();
    } catch (error) {
      setFeedback({ type: 'error', message: 'Ocurrió un error al guardar los cambios en la base de datos.' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const defaultDateString = initialNextContactAt 
    ? new Date(initialNextContactAt.getTime() - initialNextContactAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    : '';

  return (
    <form onSubmit={handleSubmit} className="atlas-card p-6 rounded-2xl border border-[#909CC2]/15 space-y-5">
      <div className="flex items-center justify-between border-b border-[#909CC2]/15 pb-4">
        <div>
          <h3 className="text-base font-brand font-semibold text-[#F0EBD8]">
            Gestión del Embudo & Seguimiento
          </h3>
          <p className="text-xs text-[#909CC2]">
            Actualiza el estado comercial, prioridad y agenda el próximo contacto.
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-[#023A40] border border-[#8BD990]/30 flex items-center justify-center text-[#8BD990]">
          <Layers size={16} />
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-[#8BD990]/15 border border-[#8BD990]/40 text-[#8BD990]'
              : 'bg-red-950/40 border border-red-500/40 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-brand uppercase tracking-wider text-[#909CC2]">
            Estado en el Embudo (Funnel)
          </label>
          <select
            name="leadStatus"
            defaultValue={initialLeadStatus || 'NUEVO'}
            className="w-full bg-[#001412] border border-[#023A40] rounded-xl px-3 py-2.5 text-xs text-[#F0EBD8] focus:outline-none focus:border-[#8BD990]"
          >
            <option value="NUEVO">Nuevo / Sin contactar</option>
            <option value="CONTACTADO">Contactado</option>
            <option value="RESPONDIO">Respondió / Interesado</option>
            <option value="PIDIO_INFO">Pidió Información</option>
            <option value="COTIZACION">Cotización enviada</option>
            <option value="VENTA">Venta concretada</option>
            <option value="PERDIDO">Perdido / Descartado</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-brand uppercase tracking-wider text-[#909CC2]">
            Nivel de Prioridad
          </label>
          <select
            name="priorityLevel"
            defaultValue={initialPriorityLevel || 'MEDIA'}
            className="w-full bg-[#001412] border border-[#023A40] rounded-xl px-3 py-2.5 text-xs text-[#F0EBD8] focus:outline-none focus:border-[#8BD990]"
          >
            <option value="ALTA">Alta (Gran interés / Cierre inminente)</option>
            <option value="MEDIA">Media (Interesado, en evaluación)</option>
            <option value="BAJA">Baja (Exploratorio, poco compromiso)</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-brand uppercase tracking-wider text-[#909CC2] flex items-center gap-1.5">
          <Calendar size={13} className="text-[#8BD990]" />
          <span>Próximo Contacto Agendado</span>
        </label>
        <input
          type="datetime-local"
          name="nextContactAt"
          defaultValue={defaultDateString}
          className="w-full bg-[#001412] border border-[#023A40] rounded-xl px-3 py-2.5 text-xs text-[#F0EBD8] focus:outline-none focus:border-[#8BD990] [color-scheme:dark]"
        />
      </div>

      {/* Bitácora de Notas & Seguimiento */}
      <div className="space-y-2 pt-2 border-t border-[#909CC2]/15">
        <label className="text-xs font-brand uppercase tracking-wider text-[#F0EBD8] font-semibold flex items-center gap-2">
          <FileText size={14} className="text-[#8BD990]" />
          <span>Bitácora de Notas & Seguimiento</span>
        </label>
        <ClientNotesTimeline 
          initialNotes={initialNotes}
          onChange={(serialized) => setNotesValue(serialized)}
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 atlas-gradient-btn py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider font-brand transition-all cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin text-[#001412]" />
              <span>Guardando Cambios...</span>
            </>
          ) : (
            <>
              <Save size={16} className="text-[#001412]" />
              <span>Guardar Avance de CRM</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
