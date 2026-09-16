'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import { 
  Phone, 
  Users, 
  MessageSquare, 
  FileText, 
  StickyNote, 
  Plus, 
  Trash2, 
  Clock, 
  Sparkles,
  Filter,
  Maximize2,
  Minimize2,
  X,
  Search,
  BookOpen,
  Columns,
  Square,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Check,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  History
} from 'lucide-react';

export type NoteCategory = 'LLAMADA' | 'REUNION' | 'WHATSAPP' | 'COTIZACION' | 'NOTA';

export interface NoteEntry {
  id: string;
  date: string; // ISO format
  category: NoteCategory;
  text: string;
  author?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

interface Props {
  clientId?: string;
  initialNotes: string | null;
  onChange: (serializedNotes: string) => void;
}

const CATEGORY_CONFIG: Record<NoteCategory, { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string; badge: string }> = {
  LLAMADA: {
    label: 'Llamada',
    icon: Phone,
    color: 'text-cyan-400',
    badge: 'bg-cyan-950/50 border-cyan-500/35 text-cyan-300',
  },
  REUNION: {
    label: 'Reunión',
    icon: Users,
    color: 'text-purple-400',
    badge: 'bg-purple-950/50 border-purple-500/35 text-purple-300',
  },
  WHATSAPP: {
    label: 'WhatsApp',
    icon: MessageSquare,
    color: 'text-[#8BD990]',
    badge: 'bg-[#023A40]/70 border-[#8BD990]/35 text-[#8BD990]',
  },
  COTIZACION: {
    label: 'Cotización',
    icon: FileText,
    color: 'text-amber-300',
    badge: 'bg-amber-950/50 border-amber-500/35 text-amber-300',
  },
  NOTA: {
    label: 'Nota Interna',
    icon: StickyNote,
    color: 'text-[#909CC2]',
    badge: 'bg-[#001c19] border-[#909CC2]/30 text-[#909CC2]',
  },
};

const QUICK_TEMPLATES = [
  { label: '📞 No contestó', text: 'Se intentó llamada de seguimiento; no contestó. Se reintentará en próximas horas.', category: 'LLAMADA' as NoteCategory },
  { label: '📄 Pidió cotización', text: 'El cliente solicitó propuesta económica detallada. Enviar por correo/WhatsApp.', category: 'COTIZACION' as NoteCategory },
  { label: '🤝 Demo agendada', text: 'Se coordinó demostración de la plataforma para profundizar requerimientos.', category: 'REUNION' as NoteCategory },
  { label: '💬 Mensaje enviado', text: 'Se envió mensaje de seguimiento por WhatsApp con información del servicio.', category: 'WHATSAPP' as NoteCategory },
];

export function parseNotes(rawNotes: string | null | undefined): NoteEntry[] {
  if (!rawNotes || !rawNotes.trim()) return [];
  try {
    const parsed = JSON.parse(rawNotes);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Si era texto libre histórico, preservarlo intacto
    return [
      {
        id: 'legacy-note',
        date: new Date().toISOString(),
        category: 'NOTA',
        text: rawNotes.trim(),
        author: 'Historial previo',
      },
    ];
  }
  return [];
}

export function ClientNotesTimeline({ clientId, initialNotes, onChange }: Props) {
  const { data: session } = useSession();
  const currentUserName = session?.user?.name || (session?.user as { username?: string })?.username || 'Atlas Admin';

  const [notes, setNotes] = useState<NoteEntry[]>(() => parseNotes(initialNotes));
  const [newText, setNewText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory>('NOTA');
  const [activeFilter, setActiveFilter] = useState<'TODOS' | NoteCategory>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewColumns, setViewColumns] = useState<'single' | 'double'>('single');
  const [showModalForm, setShowModalForm] = useState(true);

  // States for Note Editing & Deleting Confirmation
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingCategory, setEditingCategory] = useState<NoteCategory>('NOTA');
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Auto-hide toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExpanded(false);
        setEditingNoteId(null);
        setDeletingNoteId(null);
      }
    };
    if (isExpanded || editingNoteId || deletingNoteId) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, editingNoteId, deletingNoteId]);

  const updateNotesList = async (updated: NoteEntry[], persistBackend = false, toastSuccess?: string) => {
    setNotes(updated);
    const serialized = JSON.stringify(updated);
    onChange(serialized);

    if (persistBackend && clientId) {
      try {
        await fetch(`/api/clients/${clientId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: serialized }),
        });
        if (toastSuccess) {
          setToastMessage(toastSuccess);
        }
      } catch (err) {
        console.error('Error persisting notes:', err);
      }
    } else if (toastSuccess) {
      setToastMessage(toastSuccess);
    }
  };

  const handleAddNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newText.trim()) return;

    const newEntry: NoteEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      category: selectedCategory,
      text: newText.trim(),
      author: currentUserName,
    };

    const updated = [newEntry, ...notes];
    updateNotesList(updated, true, 'Nueva nota registrada y auditada correctamente.');
    setNewText('');
  };

  const startEditNote = (note: NoteEntry) => {
    setEditingNoteId(note.id);
    setEditingText(note.text);
    setEditingCategory(note.category);
  };

  const handleSaveEdit = (noteId: string) => {
    if (!editingText.trim()) return;

    const updated = notes.map((n) => {
      if (n.id === noteId) {
        return {
          ...n,
          text: editingText.trim(),
          category: editingCategory,
          updatedBy: currentUserName,
          updatedAt: new Date().toISOString(),
        };
      }
      return n;
    });

    updateNotesList(updated, true, 'Nota actualizada con registro de auditoría.');
    setEditingNoteId(null);
  };

  const handleConfirmDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    updateNotesList(updated, true, 'Nota eliminada permanentemente.');
    setDeletingNoteId(null);
  };

  const handleUseTemplate = (tmpl: typeof QUICK_TEMPLATES[0]) => {
    setSelectedCategory(tmpl.category);
    setNewText((prev) => (prev ? `${prev}\n${tmpl.text}` : tmpl.text));
  };

  // Filter notes by category and text search
  const filteredNotes = notes.filter((n) => {
    const matchesCat = activeFilter === 'TODOS' || n.category === activeFilter;
    const matchesSearch = !searchQuery.trim() || n.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const time = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      
      if (isToday) {
        return `Hoy a las ${time}`;
      }
      return `${d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })} · ${time} hs`;
    } catch {
      return dateStr;
    }
  };

  // Reusable New Note Input Form
  const renderNewNoteForm = (isModal = false) => (
    <div className={`bg-[#001c19]/90 border border-[#023A40] rounded-2xl p-5 sm:p-6 space-y-4 shadow-lg ${isModal ? 'h-full flex flex-col justify-between' : ''}`}>
      <div className="space-y-4">
        {/* Header & Category Instructions */}
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs font-brand uppercase tracking-wider text-[#F0EBD8] font-semibold flex items-center gap-2">
              <Plus size={15} className="text-[#8BD990]" />
              <span>Nueva Entrada en Bitácora</span>
            </span>
            <span className="text-[11px] text-[#909CC2]/70 font-light">
              Selecciona el tipo de evento:
            </span>
          </div>

          {/* Category Selector Buttons Grid - Organizado y Espacioso */}
          <div className={`grid ${isModal ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-2' : 'grid-cols-2 sm:grid-cols-5 gap-2.5'} pt-0.5`}>
            {(Object.keys(CATEGORY_CONFIG) as NoteCategory[]).map((cat) => {
              const cfg = CATEGORY_CONFIG[cat];
              const Icon = cfg.icon;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-brand transition-all cursor-pointer border ${
                    isSelected
                      ? `${cfg.badge} shadow-md scale-[1.02] font-semibold`
                      : 'bg-[#001412] text-[#909CC2] border-[#023A40] hover:border-[#8BD990]/40 hover:text-[#F0EBD8]'
                  }`}
                >
                  <Icon size={14} className={isSelected ? cfg.color : 'text-[#909CC2]'} />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Input Area */}
        <div className="space-y-2.5">
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            rows={isModal ? 6 : 4}
            placeholder={`Escribe aquí el resumen de la ${CATEGORY_CONFIG[selectedCategory].label.toLowerCase()} (acuerdos, comentarios, solicitudes)...`}
            className="w-full bg-[#001412] border border-[#023A40] rounded-xl p-3.5 text-xs sm:text-sm text-[#F0EBD8] placeholder-[#909CC2]/40 focus:outline-none focus:border-[#8BD990] focus:ring-1 focus:ring-[#8BD990] leading-relaxed resize-none shadow-inner"
          />

          {/* Quick Action Tags Section - Ordenado en caja dedicada */}
          <div className="p-3 rounded-xl bg-[#001412]/80 border border-[#023A40] space-y-2">
            <span className="text-[10px] uppercase font-brand text-[#909CC2] font-semibold flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#8BD990]" />
              Plantillas rápidas a un clic:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {QUICK_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUseTemplate(tmpl)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#001c19] border border-[#909CC2]/20 text-[#F0EBD8] hover:text-[#8BD990] hover:border-[#8BD990]/50 transition-all cursor-pointer font-light shadow-sm"
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={() => handleAddNote()}
          disabled={!newText.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl atlas-gradient-btn text-xs font-semibold font-brand uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg hover:shadow-[#8BD990]/20 transition-all"
        >
          <Plus size={15} />
          <span>Agregar a Bitácora</span>
        </button>
      </div>
    </div>
  );

  // Reusable Timeline List
  const renderTimelineList = (isModal = false) => (
    <div className={`space-y-4 ${isModal ? 'overflow-y-auto pr-1 pb-6 w-full' : 'max-h-[380px] overflow-y-auto pr-1'}`}>
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-[#023A40] bg-[#001412]/40">
          <Clock size={28} className="mx-auto text-[#909CC2]/40 mb-2.5" />
          <p className="text-xs sm:text-sm text-[#909CC2] font-light">
            {notes.length === 0
              ? 'No hay notas registradas todavía. Usa la caja para registrar la primera interacción.'
              : 'No se encontraron notas con el filtro o búsqueda actual.'}
          </p>
        </div>
      ) : (
        <div className={isModal ? (viewColumns === 'double' && filteredNotes.length > 1 ? "grid grid-cols-1 xl:grid-cols-2 gap-4 w-full" : "space-y-4 w-full") : "space-y-3"}>
          {filteredNotes.map((note, index) => {
            const cfg = CATEGORY_CONFIG[note.category] || CATEGORY_CONFIG.NOTA;
            const Icon = cfg.icon;
            const isEditing = editingNoteId === note.id;
            const isDeleting = deletingNoteId === note.id;

            return (
              <div
                key={note.id || index}
                className={`group relative bg-[#001c19]/90 hover:bg-[#00221f] border border-[#023A40] hover:border-[#8BD990]/40 rounded-2xl transition-all shadow-md flex flex-col justify-between w-full ${isModal ? 'p-6 sm:p-7' : 'p-4'}`}
              >
                <div>
                  {/* Note Card Header */}
                  <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#909CC2]/10 gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-brand font-medium tracking-wide ${cfg.badge}`}
                      >
                        <Icon size={14} className={cfg.color} />
                        <span>{cfg.label}</span>
                      </span>

                      <span className="text-xs text-[#909CC2]/80 font-mono">
                        {formatDate(note.date)}
                      </span>
                    </div>

                    {/* Action buttons (Edit and Delete) */}
                    <div className="flex items-center gap-1">
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => startEditNote(note)}
                          className="text-[#909CC2] hover:text-[#8BD990] transition-colors p-1.5 cursor-pointer rounded-lg hover:bg-[#023A40]/80"
                          title="Editar y agregar información (Auditoría)"
                        >
                          <Pencil size={14} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setDeletingNoteId(isDeleting ? null : note.id)}
                        className="text-[#909CC2]/70 hover:text-red-400 transition-colors p-1.5 cursor-pointer rounded-lg hover:bg-red-950/40"
                        title="Eliminar nota"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Deletion confirmation banner */}
                  {isDeleting && (
                    <div className="p-3 mb-3 bg-red-950/60 border border-red-500/50 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-fadeIn">
                      <div className="flex items-center gap-2 text-red-200">
                        <AlertTriangle size={15} className="text-red-400 shrink-0" />
                        <span>¿Eliminar esta nota? Esta acción es permanente.</span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setDeletingNoteId(null)}
                          className="px-2.5 py-1 rounded-lg bg-[#001412] hover:bg-[#023A40] text-[#909CC2] text-xs font-brand cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmDeleteNote(note.id)}
                          className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs font-brand flex items-center gap-1 shadow-md cursor-pointer"
                        >
                          <Trash2 size={12} />
                          <span>Sí, Eliminar</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Note Content / Editing Form */}
                  {isEditing ? (
                    <div className="space-y-3 py-1 animate-fadeIn">
                      <div className="flex flex-wrap items-center gap-1.5 pb-1">
                        <span className="text-[10px] uppercase font-brand text-[#909CC2]">Cambiar tipo:</span>
                        {(Object.keys(CATEGORY_CONFIG) as NoteCategory[]).map((cat) => {
                          const catCfg = CATEGORY_CONFIG[cat];
                          const CatIcon = catCfg.icon;
                          const isSelected = editingCategory === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setEditingCategory(cat)}
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-brand flex items-center gap-1 border transition-all cursor-pointer ${
                                isSelected ? `${catCfg.badge} font-semibold` : 'bg-[#001412] text-[#909CC2] border-[#023A40]'
                              }`}
                            >
                              <CatIcon size={11} className={isSelected ? catCfg.color : 'text-[#909CC2]'} />
                              <span>{catCfg.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        rows={isModal ? 5 : 3}
                        className="w-full bg-[#001412] border border-[#8BD990]/50 rounded-xl p-3 text-xs sm:text-sm text-[#F0EBD8] focus:outline-none focus:ring-1 focus:ring-[#8BD990] resize-none"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingNoteId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs font-brand text-[#909CC2] hover:text-white bg-[#001412] border border-[#023A40] cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(note.id)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-brand atlas-gradient-btn flex items-center gap-1.5 shadow-md font-semibold cursor-pointer"
                        >
                          <Check size={14} />
                          <span>Guardar Cambio y Auditar</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={`text-[#F0EBD8] leading-relaxed whitespace-pre-wrap pl-1 font-light ${isModal ? 'text-sm sm:text-base leading-7' : 'text-xs'}`}>
                      {note.text}
                    </p>
                  )}
                </div>

                {/* Audit Information Footer (Always Visible in both views) */}
                <div className="pt-3 mt-3 border-t border-[#909CC2]/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#909CC2]/70 font-mono">
                  <div className="flex items-center gap-1.5">
                    <UserCheck size={12} className="text-[#8BD990]" />
                    <span>Registrado por:</span>
                    <span className="text-[#8BD990] font-semibold">{note.author || 'Atlas Admin'}</span>
                  </div>

                  {note.updatedBy && (
                    <div className="flex items-center gap-1.5 bg-[#001412]/80 px-2 py-0.5 rounded border border-[#023A40] text-amber-300/90" title={`Editado el ${formatDate(note.updatedAt || '')}`}>
                      <History size={11} className="text-amber-400" />
                      <span>Modificado por: <strong className="text-amber-200">{note.updatedBy}</strong> ({formatDate(note.updatedAt || '')})</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 rounded-xl text-xs flex items-center gap-2.5 bg-[#8BD990]/15 border border-[#8BD990]/40 text-[#8BD990] animate-fadeIn shadow-md">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Action Bar with Expand / Fullscreen Button */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#001c19]/90 border border-[#023A40]">
        <div className="flex items-center gap-2.5">
          <BookOpen size={16} className="text-[#8BD990]" />
          <span className="text-xs font-brand uppercase tracking-wider text-[#F0EBD8] font-semibold">
            Línea de Tiempo de Bitácora
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#023A40] text-[#8BD990] border border-[#8BD990]/25 font-bold">
            {notes.length} notas
          </span>
        </div>

        {/* Desplegar / Expandir en Pantalla Completa Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#023A40]/90 hover:bg-[#023A40] border border-[#8BD990]/40 hover:border-[#8BD990] text-xs font-brand text-[#8BD990] transition-all cursor-pointer shadow-md group"
          title="Abrir en pantalla general para lectura amplia"
        >
          <Maximize2 size={13} className="group-hover:scale-110 transition-transform text-[#8BD990]" />
          <span>Expandir en Pantalla General</span>
        </button>
      </div>

      {/* Box to Add New Note (Standard View) */}
      {renderNewNoteForm(false)}

      {/* Filter Header & Notes Counter (Standard View) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#909CC2]/10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-brand uppercase tracking-wider text-[#909CC2]">
            Historial de Seguimiento
          </span>
        </div>

        {/* Filter Chips */}
        {notes.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] text-[#909CC2]/60 uppercase font-brand mr-1 flex items-center gap-1">
              <Filter size={10} />
              Filtrar:
            </span>
            <button
              type="button"
              onClick={() => setActiveFilter('TODOS')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-brand transition-colors cursor-pointer ${
                activeFilter === 'TODOS'
                  ? 'bg-[#8BD990]/20 text-[#8BD990] border border-[#8BD990]/40 font-semibold'
                  : 'text-[#909CC2] hover:text-white'
              }`}
            >
              Todos
            </button>
            {(Object.keys(CATEGORY_CONFIG) as NoteCategory[]).map((cat) => {
              const count = notes.filter((n) => n.category === cat).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveFilter(cat)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-brand transition-colors cursor-pointer ${
                    activeFilter === cat
                      ? 'bg-[#8BD990]/20 text-[#8BD990] border border-[#8BD990]/40 font-semibold'
                      : 'text-[#909CC2] hover:text-white'
                  }`}
                >
                  {CATEGORY_CONFIG[cat].label} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Timeline List (Standard View) */}
      {renderTimelineList(false)}

      {/* ========================================================================= */}
      {/* EXPANDED FULL-SCREEN IMMERSIVE READER MODAL (POSICION ELEVADA & MAX ESPACIO) */}
      {/* ========================================================================= */}
      {isExpanded && mounted && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-2 sm:pt-3 pb-2 sm:pb-3 px-2 sm:px-4 bg-[#001412]/92 backdrop-blur-2xl animate-fadeIn"
          onClick={() => setIsExpanded(false)}
        >
          <div 
            className="w-full max-w-[99vw] 2xl:max-w-[1850px] h-[97vh] atlas-card rounded-2xl sm:rounded-3xl border border-[#909CC2]/25 shadow-2xl flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top glowing accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#8BD990] to-transparent shadow-[0_0_12px_#8BD990]" />

            {/* Modal Header */}
            <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-[#909CC2]/15 flex items-center justify-between bg-[#001c19]/95 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#023A40] border border-[#8BD990]/40 flex items-center justify-center text-[#8BD990] shadow-md shrink-0">
                  <BookOpen size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-sm sm:text-lg font-brand font-semibold text-[#F0EBD8] truncate">
                      Bitácora de Seguimiento · Vista Panorámica
                    </h2>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#023A40] text-[#8BD990] border border-[#8BD990]/30 font-bold shrink-0">
                      {notes.length} notas
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#909CC2] font-light truncate hidden sm:block">
                    Espacio expandido para análisis profundo, lectura ágil y registro comercial en tiempo real
                  </p>
                </div>
              </div>

              {/* Quick Category Summary Ribbons - Aprovechando el espacio central */}
              <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-xl bg-[#001412]/80 border border-[#023A40]/80">
                <span className="text-[10px] font-brand uppercase tracking-wider text-[#909CC2]">Resumen:</span>
                {(Object.keys(CATEGORY_CONFIG) as NoteCategory[]).map((cat) => {
                  const count = notes.filter((n) => n.category === cat).length;
                  if (count === 0) return null;
                  const cfg = CATEGORY_CONFIG[cat];
                  const Icon = cfg.icon;
                  return (
                    <span key={cat} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-brand ${cfg.badge}`}>
                      <Icon size={11} className={cfg.color} />
                      <span>{cfg.label}: {count}</span>
                    </span>
                  );
                })}
              </div>

              {/* Action Buttons: Contraer y Cerrar */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#023A40]/90 border border-[#8BD990]/40 text-xs text-[#8BD990] hover:bg-[#023A40] transition-all cursor-pointer font-brand shadow-sm"
                  title="Contraer y volver a la vista estándar"
                >
                  <Minimize2 size={14} />
                  <span className="hidden sm:inline font-semibold">Contraer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 sm:p-2 rounded-xl bg-[#001412] border border-[#909CC2]/20 text-[#909CC2] hover:text-white hover:border-red-400/40 transition-all cursor-pointer"
                  aria-label="Cerrar ventana"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Split into Left & Right maximizing reading real estate */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              {/* Left Column: Form & Search Filter (3 cols en xl cuando visible, u oculta) */}
              {showModalForm && (
                <div className="lg:col-span-4 xl:col-span-3 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-[#909CC2]/15 bg-[#001412]/75 overflow-y-auto flex flex-col justify-between gap-4">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-brand uppercase tracking-wider text-[#909CC2] flex items-center gap-1.5">
                        <Search size={13} className="text-[#8BD990]" />
                        <span>Buscar en las notas</span>
                      </label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filtrar por palabra clave (ej. cotización, reunión)..."
                        className="w-full bg-[#001c19] border border-[#023A40] rounded-xl px-3.5 py-2.5 text-xs text-[#F0EBD8] placeholder-[#909CC2]/40 focus:outline-none focus:border-[#8BD990] focus:ring-1 focus:ring-[#8BD990]"
                      />
                    </div>

                    {renderNewNoteForm(true)}
                  </div>
                </div>
              )}

              {/* Right Column: Expansive Reader Timeline (toma 9 cols si hay formulario, o 12 cols completos si se oculta) */}
              <div className={`${showModalForm ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12 xl:col-span-12'} p-4 sm:p-5 md:p-6 lg:p-7 overflow-y-auto bg-[#001412]/40 flex flex-col space-y-4`}>
                {/* Filter chips header inside modal */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#909CC2]/10">
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                    <span className="text-xs font-brand uppercase tracking-wider text-[#909CC2] font-semibold">
                      Entradas Registradas ({filteredNotes.length})
                    </span>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveFilter('TODOS')}
                        className={`px-3 py-1 rounded-lg text-xs font-brand transition-colors cursor-pointer ${
                          activeFilter === 'TODOS'
                            ? 'bg-[#8BD990]/20 text-[#8BD990] border border-[#8BD990]/40 font-semibold'
                            : 'text-[#909CC2] hover:text-white bg-[#001412]'
                        }`}
                      >
                        Todos
                      </button>
                      {(Object.keys(CATEGORY_CONFIG) as NoteCategory[]).map((cat) => {
                        const count = notes.filter((n) => n.category === cat).length;
                        if (count === 0) return null;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setActiveFilter(cat)}
                            className={`px-3 py-1 rounded-lg text-xs font-brand transition-colors cursor-pointer ${
                              activeFilter === cat
                                ? 'bg-[#8BD990]/20 text-[#8BD990] border border-[#8BD990]/40 font-semibold'
                                : 'text-[#909CC2] hover:text-white bg-[#001412]'
                            }`}
                          >
                            {CATEGORY_CONFIG[cat].label} ({count})
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* View Controls: Toggle Form panel and Toggle 1 Col vs 2 Cols */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowModalForm(!showModalForm)}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#001412] hover:bg-[#023A40] border border-[#023A40] hover:border-[#8BD990]/40 text-xs font-brand text-[#909CC2] hover:text-[#8BD990] transition-all cursor-pointer"
                      title={showModalForm ? 'Ocultar panel de registro para máxima lectura' : 'Mostrar panel de registro'}
                    >
                      {showModalForm ? <PanelLeftClose size={13} /> : <PanelLeftOpen size={13} />}
                      <span>{showModalForm ? 'Ocultar Registro' : 'Mostrar Registro'}</span>
                    </button>

                    {filteredNotes.length > 1 && (
                      <div className="flex items-center p-0.5 rounded-lg bg-[#001412] border border-[#023A40]">
                        <button
                          type="button"
                          onClick={() => setViewColumns('single')}
                          className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                            viewColumns === 'single'
                              ? 'bg-[#023A40] text-[#8BD990]'
                              : 'text-[#909CC2] hover:text-white'
                          }`}
                          title="Vista de 1 columna completa"
                        >
                          <Square size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewColumns('double')}
                          className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                            viewColumns === 'double'
                              ? 'bg-[#023A40] text-[#8BD990]'
                              : 'text-[#909CC2] hover:text-white'
                          }`}
                          title="Vista de 2 columnas"
                        >
                          <Columns size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* The Timeline in Reader Mode */}
                <div className="flex-1 w-full">
                  {renderTimelineList(true)}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
