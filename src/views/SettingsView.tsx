import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { supabaseFullDDL } from '../lib/databaseSchema';
import { AppStorage } from '../lib/storage';
import { DataTable, Column } from '../components/common/DataTable';
import { AuditLog } from '../types';
import {
  Settings,
  Database,
  Shield,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Terminal,
  FileCode2,
  Lock,
  Layers
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { auditLogs, reloadAllData } = useData();
  const { currentUser, users, switchUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'database' | 'audit' | 'system'>('database');
  const [copied, setCopied] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleCopyDDL = () => {
    navigator.clipboard.writeText(supabaseFullDDL);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('Deseja restaurar os dados de demonstração originais do sistema?')) {
      AppStorage.resetToDefault();
      reloadAllData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 4000);
    }
  };

  const auditColumns: Column<AuditLog>[] = [
    {
      header: 'Timestamp',
      accessor: (l) => <span className="font-mono text-xs text-slate-300">{l.timestamp}</span>,
      className: 'w-36',
    },
    {
      header: 'Usuário',
      accessor: (l) => (
        <div>
          <span className="font-bold text-slate-100 block text-xs">{l.userName}</span>
          <span className="text-[10px] text-amber-400 font-medium">{l.userRole}</span>
        </div>
      ),
      className: 'w-36',
    },
    {
      header: 'Ação',
      accessor: (l) => (
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
            l.action === 'CREATE'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : l.action === 'UPDATE'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : l.action === 'FINALIZE'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}
        >
          {l.action}
        </span>
      ),
      className: 'w-24 text-center',
      align: 'center',
    },
    {
      header: 'Tabela / Entidade',
      accessor: (l) => <span className="font-mono text-xs text-slate-400">{l.table}</span>,
      className: 'w-32',
    },
    {
      header: 'Registro Alvo',
      accessor: (l) => (
        <div>
          <span className="font-mono font-bold text-amber-400 text-xs">{l.recordIdentifier}</span>
          {l.newValue && <span className="text-[10px] text-slate-400 block truncate max-w-xs">{l.newValue}</span>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            Configurações & Estrutura do Sistema
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Esquema PostgreSQL DDL para Supabase, trilhas de auditoria e parâmetros globais
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
          title="Restaurar dados de teste"
        >
          <RefreshCw className="w-4 h-4 text-amber-400" />
          <span>Restaurar Base Inicial</span>
        </button>
      </div>

      {resetSuccess && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold">
          Dados originais restaurados com sucesso!
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors flex items-center gap-2 ${
            activeTab === 'database'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Esquema Supabase (SQL DDL)</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Trilha de Auditoria ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors flex items-center gap-2 ${
            activeTab === 'system'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Informações do Sistema</span>
        </button>
      </div>

      {/* Database Schema DDL Tab */}
      {activeTab === 'database' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Script SQL Completo para o Supabase (PostgreSQL)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Contém todas as tabelas, foreign keys, índices, políticas RLS e triggers de auditoria prontos para execução no SQL Editor do Supabase.
              </p>
            </div>

            <button
              onClick={handleCopyDDL}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors shadow-md shrink-0 ml-4"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado para o Clipboard!' : 'Copiar Script SQL'}</span>
            </button>
          </div>

          <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-hidden shadow-2xl">
            <pre className="font-mono text-xs text-emerald-400 overflow-x-auto max-h-[500px] custom-scrollbar leading-relaxed">
              {supabaseFullDDL}
            </pre>
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <DataTable
            data={auditLogs}
            columns={auditColumns}
            keyExtractor={(l) => l.id}
            searchPlaceholder="Pesquisar log por usuário, ação ou registro..."
            searchFilter={(l, q) =>
              l.userName.toLowerCase().includes(q) ||
              l.action.toLowerCase().includes(q) ||
              l.recordIdentifier.toLowerCase().includes(q) ||
              l.table.toLowerCase().includes(q)
            }
            pageSize={15}
          />
        </div>
      )}

      {/* System Info Tab */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              Arquitetura & Especificações
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Sistema:</span>
                <span className="font-bold text-slate-200">TeS Manutenção Industrial S/A</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Versão:</span>
                <span className="font-mono font-bold text-amber-400">v2.5.0 - Production</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Framework Front-end:</span>
                <span className="font-bold text-slate-200">React 18 + Vite + TypeScript</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Design System:</span>
                <span className="font-bold text-slate-200">Tailwind CSS (Industrial Theme)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Banco de Dados:</span>
                <span className="font-bold text-slate-200">Supabase (PostgreSQL 15+)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Segurança:</span>
                <span className="font-bold text-emerald-400">Row Level Security (RLS) + RBAC</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              Perfil do Usuário Autenticado
            </h3>

            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Nome Completo</span>
                <span className="text-sm font-bold text-slate-100">{currentUser?.name}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Nível de Permissão (Role)</span>
                <span className="inline-block mt-0.5 px-2.5 py-1 text-xs font-bold rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {currentUser?.role}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Email</span>
                <span className="text-xs font-mono text-slate-300">{currentUser?.email}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
