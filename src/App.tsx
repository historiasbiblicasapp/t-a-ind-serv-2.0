import React, { useState } from 'react';
import { PWAProvider } from './contexts/PWAContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { WorkOrdersView } from './views/WorkOrdersView';
import { EquipmentView } from './views/EquipmentView';
import { MaintenanceView } from './views/MaintenanceView';
import { PlanningView } from './views/PlanningView';
import { InventoryView } from './views/InventoryView';
import { PeopleView } from './views/PeopleView';
import { SuppliersView } from './views/SuppliersView';
import { ReportsView } from './views/ReportsView';
import { IndicatorsView } from './views/IndicatorsView';
import { SettingsView } from './views/SettingsView';
import { WorkOrderFormModal } from './components/workOrders/WorkOrderFormModal';
import { WorkOrderDetailModal } from './components/workOrders/WorkOrderDetailModal';
import { WorkOrderPrintView } from './components/workOrders/WorkOrderPrintView';
import { QRScannerModal } from './components/common/QRScannerModal';
import { PageId, WorkOrder } from './types';
import { ShieldCheck } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Global Modal States
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<WorkOrder | null>(null);
  const [printingOrder, setPrintingOrder] = useState<WorkOrder | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  const { workOrders, equipment } = useData();

  // Dynamically resolve selected order so updates to scope/resources/costs update reactively
  const activeSelectedOrder = workOrders.find((w) => w.id === selectedOrderId) || null;

  // If not authenticated, display full-screen Login View
  if (!isAuthenticated) {
    return <LoginView />;
  }

  const handleSelectWorkOrder = (order: WorkOrder) => {
    setSelectedOrderId(order.id);
  };

  const handleEditWorkOrder = (order: WorkOrder) => {
    setSelectedOrderId(null);
    setEditingOrder(order);
  };

  const handlePrintWorkOrder = (order: WorkOrder) => {
    setSelectedOrderId(null);
    setPrintingOrder(order);
  };

  const handleQRScanResult = (decodedText: string) => {
    // Check if it matches an equipment code or OS number
    const foundWO = workOrders.find(
      w => w.orderNumber.toLowerCase() === decodedText.toLowerCase() ||
           w.equipmentCode.toLowerCase() === decodedText.toLowerCase()
    );

    if (foundWO) {
      setSelectedOrderId(foundWO.id);
      setIsQRScannerOpen(false);
      return;
    }

    const foundEq = equipment.find(
      e => e.code.toLowerCase() === decodedText.toLowerCase() ||
           e.tag.toLowerCase() === decodedText.toLowerCase()
    );

    if (foundEq) {
      setCurrentPage('equipment');
      setIsQRScannerOpen(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans app-root-container">
      {/* Sidebar Navigation */}
      <div className="no-print">
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => {
            setCurrentPage(page);
            setIsSidebarOpen(false);
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isOpenMobile={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden no-print">
        {/* Top Header */}
        <Header
          currentPage={currentPage}
          onNavigate={(page) => setCurrentPage(page as PageId)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenNewWorkOrder={() => setIsNewOrderModalOpen(true)}
          onOpenQRScanner={() => setIsQRScannerOpen(true)}
          onSelectWorkOrder={handleSelectWorkOrder}
        />

        {/* Dynamic Page Views Container */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentPage === 'dashboard' && (
              <DashboardView
                onSelectWorkOrder={handleSelectWorkOrder}
                onNavigate={(page) => setCurrentPage(page as PageId)}
                onOpenNewWorkOrder={() => setIsNewOrderModalOpen(true)}
              />
            )}

            {currentPage === 'work-orders' && (
              <WorkOrdersView
                onSelectWorkOrder={handleSelectWorkOrder}
                onEditWorkOrder={handleEditWorkOrder}
                onPrintWorkOrder={handlePrintWorkOrder}
                onOpenNewWorkOrder={() => setIsNewOrderModalOpen(true)}
              />
            )}

            {currentPage === 'equipment' && <EquipmentView />}

            {currentPage === 'maintenance' && (
              <MaintenanceView
                onOpenWorkOrderModal={() => setIsNewOrderModalOpen(true)}
              />
            )}

            {currentPage === 'planning' && (
              <PlanningView
                onSelectWorkOrder={handleSelectWorkOrder}
                onEditWorkOrder={handleEditWorkOrder}
              />
            )}

            {currentPage === 'inventory' && <InventoryView />}

            {currentPage === 'people' && <PeopleView />}

            {currentPage === 'suppliers' && <SuppliersView />}

            {currentPage === 'reports' && <ReportsView />}

            {currentPage === 'indicators' && <IndicatorsView />}

            {currentPage === 'settings' && (
              currentUser?.isMaster || currentUser?.email?.toLowerCase() === 'microwasmel@gmail.com' ? (
                <SettingsView />
              ) : (
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4 max-w-md mx-auto my-12">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-100">Acesso Restrito ao Administrador Master</h3>
                  <p className="text-xs text-slate-400">
                    Apenas o usuário Master tem permissão para visualizar e gerenciar as configurações do sistema.
                  </p>
                  <button
                    onClick={() => setCurrentPage('dashboard')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
                  >
                    Voltar ao Dashboard
                  </button>
                </div>
              )
            )}
          </div>
        </main>
      </div>

      {/* New or Edit Work Order Form Modal */}
      {(isNewOrderModalOpen || Boolean(editingOrder)) && (
        <WorkOrderFormModal
          isOpen={isNewOrderModalOpen || Boolean(editingOrder)}
          onClose={() => {
            setIsNewOrderModalOpen(false);
            setEditingOrder(null);
          }}
          initialData={editingOrder}
        />
      )}

      {/* Work Order 6-Tab Detail Modal */}
      {activeSelectedOrder && (
        <WorkOrderDetailModal
          isOpen={Boolean(activeSelectedOrder)}
          onClose={() => setSelectedOrderId(null)}
          workOrder={activeSelectedOrder}
          onEdit={(wo) => handleEditWorkOrder(wo)}
          onPrint={(wo) => handlePrintWorkOrder(wo)}
        />
      )}

      {/* Work Order High-Resolution Print/PDF View */}
      {printingOrder && (
        <WorkOrderPrintView
          isOpen={Boolean(printingOrder)}
          workOrder={printingOrder}
          onClose={() => setPrintingOrder(null)}
        />
      )}

      {/* Camera QR Code Scanner */}
      {isQRScannerOpen && (
        <QRScannerModal
          isOpen={isQRScannerOpen}
          onClose={() => setIsQRScannerOpen(false)}
          onScanSuccess={handleQRScanResult}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <PWAProvider>
      <AuthProvider>
        <DataProvider>
          <MainAppContent />
        </DataProvider>
      </AuthProvider>
    </PWAProvider>
  );
}
