import React, { useState } from 'react';
import {
  Menu,
  Bell,
  PlusCircle,
  QrCode,
  CheckCheck,
  AlertTriangle,
  Info,
  ShieldCheck,
  Crown,
  LogOut,
  Download,
  Wifi,
  WifiOff,
  User as UserIcon,
  ChevronDown,
  RefreshCw,
  Database
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { usePWA } from '../../contexts/PWAContext';
import { PageId } from './Sidebar';
import { formatDateTime } from '../../lib/utils';
import { WorkOrder } from '../../types';
import { BrandIcon } from '../common/BrandLogo';
import { getSupabaseConfig, syncAllEntitiesToSupabase } from '../../lib/supabase';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenSidebar?: () => void;
  onNavigate?: (page: string) => void;
  onOpenNewOS?: () => void;
  onOpenNewWorkOrder?: () => void;
  onOpenQRScanner?: () => void;
  onSelectWorkOrder?: (order: WorkOrder) => void;
  currentPage?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenSidebar,
  onNavigate,
  onOpenNewOS,
  onOpenNewWorkOrder,
  onOpenQRScanner = () => {},
  currentPage = 'dashboard',
}) => {
  const handleToggle = onToggleSidebar || onOpenSidebar || (() => {});
  const handleNewOS = onOpenNewWorkOrder || onOpenNewOS || (() => {});
  const handleNavigate = onNavigate || ((_: any) => {});

  const { currentUser, can, logout, switchUser, users } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead, workOrders, equipment, employees, parts, preventivePlans, suppliers } = useData();
  const { isOnline, isInstallable, installApp } = usePWA();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [headerSyncing, setHeaderSyncing] = useState(false);
  const [headerSyncSuccess, setHeaderSyncSuccess] = useState<boolean | null>(null);

  const supabaseConfig = getSupabaseConfig();

  const handleHeaderQuickSync = async () => {
    if (!supabaseConfig.isConfigured) {
      handleNavigate('settings');
      return;
    }
    setHeaderSyncing(true);
    setHeaderSyncSuccess(null);
    try {
      const res = await syncAllEntitiesToSupabase({
        workOrders,
        equipment,
        employees,
        parts,
        preventivePlans,
        suppliers
      });
      setHeaderSyncSuccess(res.success);
      setTimeout(() => setHeaderSyncSuccess(null), 3000);
    } catch {
      setHeaderSyncSuccess(false);
      setTimeout(() => setHeaderSyncSuccess(null), 3000);
    } finally {
      setHeaderSyncing(false);
    }
  };

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

  const currentInfo = pageTitles[currentPage] || { title: 'T&A Industrial Service', subtitle: 'Sistema de Gestão Industrial' };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Page Title */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={handleToggle}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg lg:hidden transition-colors"
            title="Abrir Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* T&A Industrial Service Brand Icon Badge */}
          <div className="flex items-center gap-2.5">
            <BrandIcon size="sm" className="hidden sm:flex" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 leading-tight flex items-center gap-2">
                <span className="sm:hidden">
                  <BrandIcon size="xs" />
                </span>
                <span>{currentInfo.title}</span>
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block">
                {currentInfo.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Online Status, PWA Install, Quick Action Buttons, Notifications, User Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Online / Offline Status Badge */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
            }`}
            title={isOnline ? 'Conexão ativa' : 'Operando offline com armazenamento local'}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Supabase Cloud Sync Quick Button */}
          <button
            id="header-supabase-sync-btn"
            onClick={handleHeaderQuickSync}
            disabled={headerSyncing}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              headerSyncSuccess === true
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : headerSyncSuccess === false
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : supabaseConfig.isConfigured
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}
            title={supabaseConfig.isConfigured ? 'Sincronizar dados em tempo real com Supabase' : 'Configurar Supabase Cloud'}
          >
            <Database className={`w-3.5 h-3.5 ${headerSyncing ? 'animate-spin text-amber-400' : 'text-amber-400'}`} />
            <span className="hidden lg:inline">
              {headerSyncing
                ? 'Sincronizando...'
                : headerSyncSuccess === true
                ? 'Sincronizado!'
                : headerSyncSuccess === false
                ? 'Erro no Sync'
                : supabaseConfig.isConfigured
                ? 'Nuvem Realtime'
                : 'Configurar Nuvem'}
            </span>
          </button>

          {/* PWA Install Button in Header */}
          {isInstallable && (
            <button
              id="header-install-pwa-btn"
              onClick={() => installApp()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-sm shadow-amber-500/20 active:scale-95"
              title="Instalar T&A Industrial Service no Navegador"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Instalar App</span>
            </button>
          )}

          {/* QR Code Scanner Button */}
          <button
            id="header-scan-qr-btn"
            onClick={onOpenQRScanner}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors shadow-sm"
            title="Escanear QR Code de Equipamento"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Scanner QR</span>
          </button>

          {/* New Work Order Button */}
          {can('criar') && (
            <button
              id="header-new-os-btn"
              onClick={handleNewOS}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-all shadow-md shadow-amber-500/20 active:scale-95"
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

          {/* Current User Profile Menu */}
          <div className="relative">
            <button
              id="header-user-profile-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-800 hover:opacity-90 transition-opacity"
            >
              <div className="hidden sm:block text-right">
                <div className="flex items-center justify-end gap-1">
                  <p className="text-xs font-semibold text-slate-200 truncate max-w-[130px]">
                    {currentUser?.name}
                  </p>
                  {currentUser?.isMaster && (
                    <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-amber-400 font-medium">
                  {currentUser?.isMaster ? 'Master Admin' : currentUser?.role}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                {currentUser?.isMaster ? <Crown className="w-4 h-4 text-amber-400" /> : (currentUser?.name?.charAt(0) || 'U')}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-2 overflow-hidden">
                <div className="p-3 border-b border-slate-800/80 mb-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-100">{currentUser?.name}</p>
                    {currentUser?.isMaster && (
                      <span className="text-[9px] px-1 py-0.2 bg-amber-500 text-slate-950 font-extrabold rounded">MASTER</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono truncate">{currentUser?.email}</p>
                  <p className="text-[10px] text-amber-400 mt-0.5">{currentUser?.company}</p>
                </div>

                <div className="space-y-1">
                  <div className="px-2 py-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Trocar Usuário Ativo
                    </span>
                  </div>
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        currentUser?.id === u.id
                          ? 'bg-amber-500/20 text-amber-300 font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {u.isMaster && <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                        <span className="truncate">{u.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{u.role}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair da Conta / Desconectar</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
