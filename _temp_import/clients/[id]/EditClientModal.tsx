'use client';

import { useState } from 'react';
import { X, Loader2, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  client: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    company: string | null;
    location: string | null;
  };
}

export function EditClientModal({ client }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') || null,
      company: formData.get('company') || null,
      phone: formData.get('phone') || null,
      location: formData.get('location') || null,
      email: formData.get('email') || null,
    };

    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Error al editar');
      }
      
      setIsOpen(false);
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Hubo un error al actualizar los datos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-amber-400 hover:text-amber-300 text-xs font-medium flex items-center gap-1 transition-colors"
      >
        <Edit size={14} /> Editar
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="font-bold text-white text-lg">Editar Contacto</h2>
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
                  <label className="text-sm font-medium text-gray-300">Taller / Empresa</label>
                  <input
                    name="company"
                    defaultValue={client.company || ''}
                    placeholder="Ej. Taller Los Amigos"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Nombre Contacto</label>
                  <input
                    name="name"
                    defaultValue={client.name || ''}
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Teléfono</label>
                  <input
                    name="phone"
                    defaultValue={client.phone || ''}
                    placeholder="Ej. 11 1234-5678"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300">Ubicación</label>
                  <input
                    name="location"
                    defaultValue={client.location || ''}
                    placeholder="Ej. Córdoba Capital"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-medium text-gray-300">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={client.email || ''}
                    placeholder="taller@email.com"
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
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
