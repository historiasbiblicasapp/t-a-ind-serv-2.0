import React, { useState } from 'react';
import {
  Menu,
  Bell,
  PlusCircle,
  QrCode,
  Search,
  CheckCheck,
  AlertTriangle,
  Info,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { PageId } from './Sidebar';
import { formatDateTime } from '../../lib/utils';

interface HeaderProps {
  onOpenSidebar: () => void;
  onNavigate: (page: PageId) => void;
  onOpenNewOS: () => void;
  onOpenQRScanner: () => void;
  currentPage: PageId;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  onNavigate,
  onOpenNewOS,
  onOpenQRScanner,
  currentPage,
}) => {
  const { currentUser, can } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const pageTitles: Record<PageId, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard Geral', subtitle: 'Visão executiva em tempo real dos ativos industriais' },
    'work-orders': { title: 'Ordens de Serviço', subtitle: 'Controle de manutenções corretivas, preventivas e emergenciais' },
    maintenance: { title: 'Manutenção Preventiva', subtitle: 'Planos sistemáticos, periodicidades e checklists operacionais' },
    equipment: { title: 'Equipamentos & Ativos', subtitle: 'Cadastro técnico, criticidade, fichas de máquina e QR Code' },
    planning: { title: 'Planejamento e Controle (PCM)', subtitle: 'Cronograma, nivelamento de recursos e paradas programadas' },
    inventory: { title: 'Almoxarifado & Estoque', subtitle: 'Gestão de peças sobressalentes, ferramentas e materiais' },
    people: { title: 'Pessoas & Equipes', subtitle: 'Funcionários, Cargos e Níveis de Permissão RBAC' },
    suppliers: { title: 'Fornecedores & Parceiros', subtitle: 'Catálogo de fornecedores homologados e componentes' },
    reports: { title: 'Relatórios Gerenciais', subtitle: 'Exportação oficial para PDF, Excel, CSV e Impressão' },
    indicators: { title: 'Indicadores de Confiabilidade', subtitle: 'Cálculo automatizado de MTBF, MTTR e Disponibilidade' },
    settings: { title: 'Configurações do Sistema', subtitle: 'Banco de dados Supabase, Auditoria e Parâmetros' },
  };

  const currentInfo = pageTitles[currentPage] || { title: 'TeS Manutenção', subtitle: 'Sistema de Gestão Industrial' };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Page Title */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={onOpenSidebar}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg lg:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 leading-tight">
              {currentInfo.title}
            </h2>
            <p className="text-xs text-slate-400 hidden sm:block">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons, Notifications, User Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* QR Code Scanner Button */}
          <button
            id="header-scan-qr-btn"
            onClick={onOpenQRScanner}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors shadow-sm"
            title="Escanear QR Code de Equipamento"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Scanner QR</span>
          </button>

          {/* New Work Order Button */}
          {can('criar') && (
            <button
              id="header-new-os-btn"
              onClick={onOpenNewOS}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              <span>Nova OS</span>
            </button>
          )}

          {/* Notifications Drawer */}
          <div className="relative">
            <button
              id="header-notifications-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
              title="Notificações do Sistema"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                      Notificações ({unreadCount} não lidas)
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Marcar lidas
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      Nenhuma notificação no momento.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-3.5 transition-colors cursor-pointer ${
                          notif.read ? 'bg-slate-900/40 hover:bg-slate-800/40' : 'bg-slate-800/60 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5">
                            {notif.severity === 'critical' ? (
                              <AlertTriangle className="w-4 h-4 text-rose-400" />
                            ) : notif.severity === 'warning' ? (
                              <AlertTriangle className="w-4 h-4 text-amber-400" />
                            ) : (
                              <Info className="w-4 h-4 text-sky-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold ${notif.read ? 'text-slate-300' : 'text-slate-100'}`}>
                              {notif.title}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              {formatDateTime(notif.createdAt)}
                            </span>
                          </div>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 mt-1" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Current User Quick Badge */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-200">{currentUser?.name}</p>
              <p className="text-[10px] text-amber-400 font-medium">{currentUser?.role}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
              {currentUser?.name.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
