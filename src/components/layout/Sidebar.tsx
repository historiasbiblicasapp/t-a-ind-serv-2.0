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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

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
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpen,
  onClose,
}) => {
  const { currentUser, logout, switchUser, users } = useAuth();
  const { workOrders, parts } = useData();

  const openOrdersCount = workOrders.filter(w => w.status === 'Aberta' || w.status === 'Em execução').length;
  const lowStockCount = parts.filter(p => p.status === 'Estoque Baixo' || p.status === 'Crítico' || p.status === 'Sem Estoque').length;

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
    { id: 'settings' as PageId, label: 'Configurações', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="font-extrabold text-slate-950 text-xl tracking-tighter">TeS</span>
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-base leading-tight tracking-tight">TeS Manutenção</h1>
            <p className="text-[10px] uppercase font-semibold tracking-wider text-amber-400/90 mt-0.5">
              Gestão Industrial
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
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
                id={`nav-item-${item.id}`}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md border ${
                      isActive ? 'bg-slate-950/20 text-slate-950 border-slate-950/30' : item.badgeColor
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
                {currentUser?.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{currentUser?.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] text-amber-400/90 font-medium truncate">
                    {currentUser?.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Profile Switcher for Multi-User testing */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <select
                id="user-role-quick-select"
                value={currentUser.id}
                onChange={(e) => switchUser(e.target.value)}
                className="text-[11px] bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-amber-500/50"
                title="Trocar Usuário / Perfil"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.role}: {u.name.split(' ')[0]}
                  </option>
                ))}
              </select>

              <button
                id="btn-logout"
                onClick={logout}
                className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                title="Reiniciar Sessão"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
