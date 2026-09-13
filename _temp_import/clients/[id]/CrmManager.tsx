'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  clientId: string;
  initialLeadStatus: string | null;
  initialNextContactAt: Date | null;
  initialNotes: string | null;
}

export function CrmManager({ clientId, initialLeadStatus, initialNextContactAt, initialNotes }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      leadStatus: formData.get('leadStatus'),
      nextContactAt: formData.get('nextContactAt') || null,
      notes: formData.get('notes'),
    };

    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Error al actualizar CRM');
      
      router.refresh();
      // Pequeño timeout para feedback visual, pero en Next.js refresh hace su trabajo.
      setTimeout(() => alert('Datos de CRM guardados'), 200);
    } catch (error) {
      alert('Hubo un error al actualizar los datos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  // Convert Date to YYYY-MM-DDTHH:mm for local datetime-local input
  const defaultDateString = initialNextContactAt 
    ? new Date(initialNextContactAt.getTime() - initialNextContactAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-300">Estado en el Funnel</label>
        <select
          name="leadStatus"
          defaultValue={initialLeadStatus || 'NUEVO'}
          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
        >
          <option value="NUEVO">Nuevo / Sin contactar</option>
          <option value="CONTACTADO">Contactado</option>
          <option value="RESPONDIO">Respondió</option>
          <option value="PIDIO_INFO">Pidió Info</option>
          <option value="COTIZACION">Cotización enviada</option>
          <option value="VENTA">Venta concretada</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-300">Próximo Contacto</label>
        <input
          type="datetime-local"
          name="nextContactAt"
          defaultValue={defaultDateString}
          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500 [color-scheme:dark]"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-300">Notas de Venta</label>
        <textarea
          name="notes"
          rows={5}
          defaultValue={initialNotes || ''}
          placeholder="Anota detalles de la conversación, si le pasaste precio, etc."
          className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
      >
        {isLoading && <Loader2 size={16} className="animate-spin" />}
        Guardar Avance
      </button>
    </form>
  );
}
