import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  Cpu,
  CalendarDays,
  Package,
  Users,
  Building2,
  FileSpreadsheet,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Download,
  Wifi,
  WifiOff,
  Crown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { usePWA } from '../../contexts/PWAContext';
import { BrandLogo } from '../common/BrandLogo';

export type PageId =
  | 'dashboard'
  | 'work-orders'
  | 'maintenance'
  | 'equipment'
  | 'planning'
  | 'inventory'
  | 'people'
  | 'suppliers'
  | 'reports'
  | 'indicators'
  | 'settings';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  isOpen,
  onClose,
}) => {
  const isDrawerOpen = isOpenMobile !== undefined ? isOpenMobile : Boolean(isOpen);
  const handleClose = onCloseMobile || onClose || (() => {});

  const { currentUser, logout, switchUser, users } = useAuth();
  const { workOrders, parts } = useData();
  const { isOnline, isInstallable, installApp } = usePWA();

  const openOrdersCount = workOrders.filter(w => w.status === 'Aberta' || w.status === 'Em execução').length;
  const lowStockCount = parts.filter(p => p.status === 'Estoque Baixo' || p.status === 'Crítico' || p.status === 'Sem Estoque').length;

  const isMasterUser = Boolean(currentUser?.isMaster || currentUser?.email?.toLowerCase() === 'microwasmel@gmail.com');

  const menuItems = [
    { id: 'dashboard' as PageId, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'work-orders' as PageId, label: 'Ordens de Serviço', icon: ClipboardList, badge: openOrdersCount > 0 ? openOrdersCount : undefined, badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { id: 'maintenance' as PageId, label: 'Manutenção', icon: Wrench },
    { id: 'equipment' as PageId, label: 'Equipamentos', icon: Cpu },
    { id: 'planning' as PageId, label: 'Planejamento', icon: CalendarDays },
    { id: 'inventory' as PageId, label: 'Estoque', icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
    { id: 'people' as PageId, label: 'Pessoas', icon: Users },
    { id: 'suppliers' as PageId, label: 'Fornecedores', icon: Building2 },
    { id: 'reports' as PageId, label: 'Relatórios', icon: FileSpreadsheet },
    { id: 'indicators' as PageId, label: 'Indicadores', icon: BarChart3 },
    ...(isMasterUser ? [{ id: 'settings' as PageId, label: 'Configurações', icon: Settings }] : []),
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isDrawerOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <BrandLogo size="md" showText={true} />
        </div>

        {/* PWA / Offline Status Pill */}
        <div className="px-4 pt-3 pb-1">
          <div className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-semibold ${
            isOnline 
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
          }`}>
            <div className="flex items-center gap-1.5">
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5 animate-pulse" />}
              <span>{isOnline ? 'Online • Sincronizado' : 'Modo Offline'}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">PWA</span>
          </div>

          {/* PWA Install Button */}
          {isInstallable && (
            <button
              id="sidebar-install-pwa-btn"
              onClick={() => installApp()}
              className="w-full mt-2 flex items-center justify-center gap-2 py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar Aplicativo</span>
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Menu Principal
            </span>
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  onNavigate(item.id);
                  handleClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${
                      isActive
                        ? 'bg-slate-950/20 text-slate-950 border-slate-950/30'
                        : item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Session & Role Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs">
                {currentUser?.isMaster ? <Crown className="w-4 h-4 text-amber-400" /> : (currentUser?.name?.charAt(0) || 'U')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-semibold text-slate-200 truncate">{currentUser?.name}</p>
                  {currentUser?.isMaster && (
                    <span className="text-[9px] px-1 py-0.2 bg-amber-500 text-slate-950 font-extrabold rounded">MASTER</span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] text-amber-400/90 font-medium truncate">
                    {currentUser?.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Profile Switcher for Multi-User testing */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <select
                id="user-role-quick-select"
                value={currentUser?.id || ''}
                onChange={(e) => switchUser(e.target.value)}
                className="text-[11px] bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-amber-500/50 flex-1 truncate"
                title="Trocar Usuário / Perfil"
              >
                {users
                  .filter((u) => !u.isMaster || isMasterUser)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.isMaster ? '★ Master: ' : `${u.role}: `}{u.name.split(' ')[0]}
                    </option>
                  ))}
              </select>

              <button
                id="btn-logout"
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                title="Sair do Sistema / Login"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
