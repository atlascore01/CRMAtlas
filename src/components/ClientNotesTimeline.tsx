'use client';

import React, { useState, useEffect } from 'react';
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
  BookOpen
} from 'lucide-react';

export type NoteCategory = 'LLAMADA' | 'REUNION' | 'WHATSAPP' | 'COTIZACION' | 'NOTA';

export interface NoteEntry {
  id: string;
  date: string; // ISO format
  category: NoteCategory;
  text: string;
  author?: string;
}

interface Props {
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

export function ClientNotesTimeline({ initialNotes, onChange }: Props) {
  const [notes, setNotes] = useState<NoteEntry[]>(() => parseNotes(initialNotes));
  const [newText, setNewText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory>('NOTA');
  const [activeFilter, setActiveFilter] = useState<'TODOS' | NoteCategory>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExpanded(false);
    };
    if (isExpanded) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  const updateNotesList = (updated: NoteEntry[]) => {
    setNotes(updated);
    onChange(JSON.stringify(updated));
  };

  const handleAddNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newText.trim()) return;

    const newEntry: NoteEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      category: selectedCategory,
      text: newText.trim(),
      author: 'Atlas Admin',
    };

    const updated = [newEntry, ...notes];
    updateNotesList(updated);
    setNewText('');
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    updateNotesList(updated);
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
    <div className={`bg-[#001c19]/90 border border-[#023A40] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-lg ${isModal ? 'h-full flex flex-col justify-between' : ''}`}>
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <span className="text-xs font-brand uppercase tracking-wider text-[#F0EBD8] font-semibold flex items-center gap-1.5">
            <Plus size={14} className="text-[#8BD990]" />
            <span>Nueva Entrada en Bitácora</span>
          </span>

          {/* Category Selector Chips */}
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(CATEGORY_CONFIG) as NoteCategory[]).map((cat) => {
              const cfg = CATEGORY_CONFIG[cat];
              const Icon = cfg.icon;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-brand transition-all cursor-pointer ${
                    isSelected
                      ? `${cfg.badge} shadow-sm scale-105 border`
                      : 'bg-[#001412] text-[#909CC2]/70 border border-[#023A40] hover:text-[#F0EBD8]'
                  }`}
                >
                  <Icon size={12} className={isSelected ? cfg.color : ''} />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            rows={isModal ? 6 : 3}
            placeholder={`Registrar detalle de ${CATEGORY_CONFIG[selectedCategory].label.toLowerCase()}...`}
            className="w-full bg-[#001412] border border-[#023A40] rounded-xl p-3 text-xs text-[#F0EBD8] placeholder-[#909CC2]/40 focus:outline-none focus:border-[#8BD990] focus:ring-1 focus:ring-[#8BD990] leading-relaxed resize-none"
          />

          {/* Quick Action Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] uppercase font-brand text-[#909CC2]/60 mr-1 flex items-center gap-1">
              <Sparkles size={11} className="text-[#8BD990]" />
              Plantillas:
            </span>
            {QUICK_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleUseTemplate(tmpl)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-[#001412] border border-[#909CC2]/15 text-[#909CC2] hover:text-[#8BD990] hover:border-[#8BD990]/40 transition-colors cursor-pointer"
              >
                {tmpl.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={() => handleAddNote()}
          disabled={!newText.trim()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl atlas-gradient-btn text-xs font-semibold font-brand uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
        >
          <Plus size={14} />
          <span>Agregar a Bitácora</span>
        </button>
      </div>
    </div>
  );

  // Reusable Timeline List
  const renderTimelineList = (isModal = false) => (
    <div className={`space-y-3 ${isModal ? 'overflow-y-auto pr-2' : 'max-h-[380px] overflow-y-auto pr-1'}`}>
      {filteredNotes.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-[#023A40] bg-[#001412]/40">
          <Clock size={26} className="mx-auto text-[#909CC2]/40 mb-2" />
          <p className="text-xs text-[#909CC2] font-light">
            {notes.length === 0
              ? 'No hay notas registradas todavía. Usa la caja para registrar la primera interacción.'
              : 'No se encontraron notas con el filtro o búsqueda actual.'}
          </p>
        </div>
      ) : (
        filteredNotes.map((note, index) => {
          const cfg = CATEGORY_CONFIG[note.category] || CATEGORY_CONFIG.NOTA;
          const Icon = cfg.icon;

          return (
            <div
              key={note.id || index}
              className={`group relative bg-[#001c19]/80 hover:bg-[#00221f] border border-[#023A40] hover:border-[#8BD990]/30 rounded-2xl p-4 transition-all shadow-md ${isModal ? 'p-5' : 'p-3.5'}`}
            >
              {/* Note Card Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-[11px] font-brand font-medium tracking-wide ${cfg.badge}`}
                  >
                    <Icon size={12} className={cfg.color} />
                    <span>{cfg.label}</span>
                  </span>

                  <span className="text-[11px] text-[#909CC2]/75 font-mono">
                    {formatDate(note.date)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteNote(note.id)}
                  className="opacity-0 group-hover:opacity-100 text-[#909CC2]/50 hover:text-red-400 transition-opacity p-1 cursor-pointer"
                  title="Eliminar entrada"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Note Content */}
              <p className={`text-[#F0EBD8] leading-relaxed whitespace-pre-wrap pl-1 font-light ${isModal ? 'text-sm' : 'text-xs'}`}>
                {note.text}
              </p>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Action Bar with Expand / Fullscreen Button */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#001c19]/90 border border-[#023A40]">
        <div className="flex items-center gap-2">
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
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#023A40]/90 hover:bg-[#023A40] border border-[#8BD990]/40 hover:border-[#8BD990] text-xs font-brand text-[#8BD990] transition-all cursor-pointer shadow-md group"
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
      {/* EXPANDED FULL-SCREEN IMMERSIVE READER MODAL (NO DESPLIEGA HACIA ABAJO)  */}
      {/* ========================================================================= */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-8 bg-[#001412]/90 backdrop-blur-2xl animate-fadeIn"
          onClick={() => setIsExpanded(false)}
        >
          <div 
            className="w-full max-w-5xl h-[90vh] max-h-[950px] atlas-card rounded-3xl border border-[#909CC2]/25 shadow-2xl flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top glowing accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#8BD990] to-transparent shadow-[0_0_12px_#8BD990]" />

            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-[#909CC2]/15 flex items-center justify-between bg-[#001c19]/95">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#023A40] border border-[#8BD990]/40 flex items-center justify-center text-[#8BD990] shadow-md">
                  <BookOpen size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-base sm:text-xl font-brand font-semibold text-[#F0EBD8]">
                      Bitácora de Seguimiento · Modo Lectura General
                    </h2>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#023A40] text-[#8BD990] border border-[#8BD990]/30 font-bold">
                      {notes.length} notas
                    </span>
                  </div>
                  <p className="text-xs text-[#909CC2] mt-0.5 font-light">
                    Espacio expandido enfocado en lectura, revisión de acuerdos y registro comercial
                  </p>
                </div>
              </div>

              {/* Action Buttons: Contraer y Cerrar */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#023A40]/90 border border-[#8BD990]/40 text-xs text-[#8BD990] hover:bg-[#023A40] transition-all cursor-pointer font-brand"
                  title="Contraer y volver a la vista estándar"
                >
                  <Minimize2 size={14} />
                  <span className="hidden sm:inline font-semibold">Contraer Pantalla</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="p-2 rounded-xl bg-[#001412] border border-[#909CC2]/20 text-[#909CC2] hover:text-white hover:border-red-400/40 transition-all cursor-pointer"
                  aria-label="Cerrar ventana"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Split into Left (New note) & Right (Expansive Reader Timeline) */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              {/* Left Column: Form & Filters */}
              <div className="lg:col-span-5 p-5 border-b lg:border-b-0 lg:border-r border-[#909CC2]/15 bg-[#001412]/70 overflow-y-auto flex flex-col justify-between gap-4">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-brand uppercase tracking-wider text-[#909CC2] flex items-center gap-1.5">
                      <Search size={12} className="text-[#8BD990]" />
                      <span>Buscar en las notas</span>
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filtrar por palabra clave (ej. cotización, reunión)..."
                      className="w-full bg-[#001c19] border border-[#023A40] rounded-xl px-3 py-2 text-xs text-[#F0EBD8] placeholder-[#909CC2]/40 focus:outline-none focus:border-[#8BD990]"
                    />
                  </div>

                  {renderNewNoteForm(true)}
                </div>
              </div>

              {/* Right Column: Expansive Reader Timeline */}
              <div className="lg:col-span-7 p-5 sm:p-6 overflow-y-auto bg-[#001412]/40 flex flex-col">
                {/* Filter chips header inside modal */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-[#909CC2]/10">
                  <span className="text-xs font-brand uppercase tracking-wider text-[#909CC2]">
                    Entradas Registradas ({filteredNotes.length})
                  </span>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveFilter('TODOS')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-brand transition-colors cursor-pointer ${
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
                          className={`px-2.5 py-1 rounded-lg text-xs font-brand transition-colors cursor-pointer ${
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

                {/* The Timeline in Reader Mode */}
                <div className="flex-1">
                  {renderTimelineList(true)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
