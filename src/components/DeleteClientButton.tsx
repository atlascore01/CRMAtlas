'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, AlertTriangle, Loader2, X } from 'lucide-react';

interface Props {
  clientId: string;
  clientName: string;
}

export function DeleteClientButton({ clientId, clientName }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');

    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Error al eliminar cliente');
      }

      setIsOpen(false);
      router.push('/dashboard/clients');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el cliente.');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 hover:border-red-500/80 text-xs font-brand text-red-300 hover:text-white transition-all cursor-pointer shadow-sm uppercase tracking-wider"
        title="Eliminar este cliente de la base de datos"
      >
        <Trash2 size={14} />
        <span>Eliminar Cliente</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001412]/85 backdrop-blur-md animate-fadeIn">
          <div className="atlas-card w-full max-w-md rounded-2xl border border-red-500/40 shadow-2xl p-6 relative">
            <div className="flex items-start justify-between pb-3 border-b border-[#909CC2]/15 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="text-base font-brand font-bold text-[#F0EBD8]">
                    ¿Eliminar Cliente / Lead?
                  </h3>
                  <p className="text-xs text-[#909CC2]">
                    Esta acción es definitiva e irreversible.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isDeleting && setIsOpen(false)}
                className="p-1 rounded-lg text-[#909CC2] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs">
                {error}
              </div>
            )}

            <p className="text-xs sm:text-sm text-[#F0EBD8]/90 leading-relaxed mb-6 font-light">
              Estás a punto de borrar a <strong className="text-white font-semibold font-brand">{clientName}</strong>. Se eliminará toda su información de contacto, historial de notas, acuerdos y registros del embudo de ventas.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#909CC2]/10">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-brand text-[#909CC2] hover:text-white hover:bg-[#023A40] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-brand font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
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
    </>
  );
}
