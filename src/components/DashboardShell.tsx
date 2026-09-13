'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  LogOut, 
  Menu, 
  X, 
  Sparkles, 
  ChevronRight,
  Shield,
  Activity,
  UserCheck
} from 'lucide-react';
import { AtlascoreLogo } from './AtlascoreLogo';

interface ShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: ShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      name: 'Resumen Ejecutivo',
      href: '/dashboard',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: 'Directorio de Clientes',
      href: '/dashboard/clients',
      icon: Users,
      exact: false,
    },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-[#001412] text-[#F0EBD8] flex flex-col md:flex-row atlas-grid-pattern">
      {/* Mobile Top Navigation */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#023A40]/80 backdrop-blur-md border-b border-[#909CC2]/15 sticky top-0 z-40">
        <AtlascoreLogo variant="gradient" size="sm" />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-[#001412] border border-[#909CC2]/20 text-[#8BD990]"
          aria-label="Abrir menú"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#001412]/95 md:bg-[#023A40]/30 backdrop-blur-xl border-r border-[#909CC2]/15 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 md:static ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-[#909CC2]/15 flex items-center justify-between">
            <Link href="/dashboard" className="group">
              <AtlascoreLogo variant="gradient" size="md" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 text-[#909CC2] hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Slogan Pill Badge */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#023A40]/60 border border-[#8BD990]/20 text-[11px] text-[#8BD990] font-brand tracking-wider uppercase">
              <Sparkles size={12} className="text-[#8BD990]" />
              <span>Innovación que Transforma</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-2 space-y-1.5">
            <div className="px-3 py-1 text-[10px] font-brand uppercase tracking-widest text-[#909CC2]/60 font-semibold">
              Módulos CRM
            </div>
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname?.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-[#8BD990]/20 to-[#4B4BA1]/10 border border-[#8BD990]/40 text-[#8BD990] font-brand'
                      : 'text-[#909CC2] hover:text-[#F0EBD8] hover:bg-[#023A40]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? 'text-[#8BD990]'
                          : 'text-[#909CC2] group-hover:text-[#8BD990] transition-colors'
                      }
                    />
                    <span>{item.name}</span>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8BD990] shadow-[0_0_8px_#8BD990]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Signout Footer */}
        <div className="p-4 border-t border-[#909CC2]/15 bg-[#001412]/50">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#023A40]/40 border border-[#909CC2]/10 mb-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#8BD990] to-[#4B4BA1] flex items-center justify-center font-brand font-bold text-[#001412] text-sm shrink-0">
              AC
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#F0EBD8] truncate font-brand">
                Atlascore Admin
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-[#8BD990]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8BD990] animate-pulse" />
                <span>En Línea</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-transparent hover:border-red-900/30 transition-all cursor-pointer font-brand uppercase tracking-wider"
          >
            <LogOut size={14} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <div className="h-16 border-b border-[#909CC2]/15 bg-[#001412]/60 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-[#909CC2]">
              <span className="text-[#8BD990] font-brand">Atlascore CRM</span>
              <span>/</span>
              <span className="text-[#F0EBD8] capitalize">
                {pathname === '/dashboard' ? 'Panel Principal' : 'Clientes'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#023A40]/40 border border-[#909CC2]/15 text-xs text-[#909CC2]">
              <Activity size={13} className="text-[#8BD990]" />
              <span className="font-mono text-[11px]">Sistema Activo</span>
            </div>

            <div className="text-xs text-[#909CC2] hidden md:block">
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
              })}
            </div>
          </div>
        </div>

        {/* Child Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
