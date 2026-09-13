'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function NewClientModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      company: formData.get('company'),
      phone: formData.get('phone'),
      location: formData.get('location'),
      email: formData.get('email') || undefined,
      leadStatus: formData.get('leadStatus'),
      notes: formData.get('notes'),
    };

    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Error al crear el lead');
      
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      alert('Hubo un error al guardar el lead');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-amber-500 hover:bg-amber-400 text-gray-900 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
      >
        + Nuevo Lead
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="font-bold text-white text-lg">Nuevo Lead / Cliente</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Taller / Empresa *</label>
                  <input
                    required
                    name="company"
                    placeholder="Ej. Taller Los Amigos"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Nombre Contacto</label>
                  <input
                    name="name"
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Teléfono *</label>
                  <input
                    required
                    name="phone"
                    placeholder="Ej. 11 1234-5678"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Ubicación</label>
                  <input
                    name="location"
                    placeholder="Ej. Córdoba Capital"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-medium text-gray-300">Email (Opcional)</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="taller@email.com"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-medium text-gray-300">Estado del Lead *</label>
                  <select
                    name="leadStatus"
                    required
                    defaultValue="NUEVO"
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
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-medium text-gray-300">Notas iniciales</label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="¿De dónde vino el contacto? ¿Qué necesita?"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-900 font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  Guardar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
