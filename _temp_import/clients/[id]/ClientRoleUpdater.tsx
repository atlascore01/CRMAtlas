'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, RefreshCw } from 'lucide-react';

interface Props {
  clientId: string;
  currentRole: string;
}

const roles = [
  { value: 'CLIENTE_FINAL', label: '👤 Cliente Final', description: 'Precio lista (B2C)' },
  { value: 'TALLER_PRO', label: '🔧 Taller Pro', description: 'Precio mayorista (B2B)' },
  { value: 'DISTRIBUIDOR', label: '🏪 Distribuidor', description: 'Precio mayorista (B2B)' },
];

export function ClientRoleUpdater({ clientId, currentRole }: Props) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const hasChanges = role !== currentRole;

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientRole: role }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {roles.map((r) => (
          <label
            key={r.value}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
              role === r.value
                ? 'border-amber-500/50 bg-amber-500/10'
                : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
            }`}
          >
            <input
              type="radio"
              name="clientRole"
              value={r.value}
              checked={role === r.value}
              onChange={() => setRole(r.value)}
              className="accent-amber-500"
            />
            <div>
              <p className="text-sm font-medium text-white">{r.label}</p>
              <p className="text-xs text-gray-500">{r.description}</p>
            </div>
          </label>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={!hasChanges || saving}
        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
      >
        {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
        {saved ? '✓ Rol actualizado' : saving ? 'Guardando...' : 'Actualizar rol'}
      </button>
    </div>
  );
}
