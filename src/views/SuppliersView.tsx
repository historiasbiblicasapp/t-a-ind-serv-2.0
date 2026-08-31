import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Supplier } from '../types';
import { DataTable, Column } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { generateUUID } from '../lib/utils';
import { Building2, PlusCircle, Phone, Mail, MapPin, CheckCircle2, ShieldAlert } from 'lucide-react';

export const SuppliersView: React.FC = () => {
  const { suppliers, saveSupplier } = useData();
  const { can } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tradeName, setTradeName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [category, setCategory] = useState('Rolamentos & Transmissão');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Joinville');
  const [state, setState] = useState('SC');

  const handleOpenNew = () => {
    setTradeName('');
    setLegalName('');
    setCnpj('');
    setCategory('Rolamentos & Transmissão');
    setContactName('');
    setEmail('');
    setPhone('');
    setCity('Joinville');
    setState('SC');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const sup: Supplier = {
      id: generateUUID(),
      tradeName,
      legalName,
      cnpj,
      category,
      contactName,
      email,
      phone,
      city,
      state,
      isApproved: true,
      active: true,
      createdAt: new Date().toISOString()
    };
    saveSupplier(sup);
    setIsModalOpen(false);
  };

  const columns: Column<Supplier>[] = [
    {
      header: 'Fornecedor / Razão Social',
      accessor: (s) => (
        <div>
          <span className="font-bold text-slate-100 block text-xs">{s.tradeName}</span>
          <span className="text-[11px] text-slate-400">{s.companyName || s.legalName || s.tradeName}</span>
        </div>
      ),
    },
    {
      header: 'CNPJ',
      accessor: (s) => <span className="font-mono text-xs text-slate-300">{s.cnpj}</span>,
      className: 'w-36',
    },
    {
      header: 'Especialidade / Categoria',
      accessor: (s) => (
        <span className="text-xs text-slate-300">
          {s.category || (s.categoriesSupplied && s.categoriesSupplied.join(', ')) || 'Geral'}
        </span>
      ),
      className: 'text-xs text-slate-300',
    },
    {
      header: 'Contato Principal',
      accessor: (s) => (
        <div>
          <span className="text-xs text-slate-200 font-medium block">{s.contactPerson || s.contactName || 'Representante'}</span>
          <span className="text-[11px] text-slate-400">{s.email || s.phone}</span>
        </div>
      ),
    },
    {
      header: 'Localização',
      accessor: (s) => (
        <span className="text-xs text-slate-300">
          {s.city || 'Joinville'}/{s.state || 'SC'}
        </span>
      ),
      className: 'w-28',
    },
    {
      header: 'Homologação',
      accessor: (s) => (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Homologado
        </span>
      ),
      className: 'w-32 text-center',
      align: 'center',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            Fornecedores Homologados & Prestadores de Serviço
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Catálogo de fabricantes de componentes, usinagem externa e assistência técnica
          </p>
        </div>

        {can('criar') && (
          <button
            onClick={handleOpenNew}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-all shadow-md shadow-amber-500/20 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Novo Fornecedor</span>
          </button>
        )}
      </div>

      {/* DataTable */}
      <DataTable
        data={suppliers}
        columns={columns}
        keyExtractor={(s) => s.id}
        searchPlaceholder="Pesquisar por razão social, nome fantasia, CNPJ..."
        searchFilter={(s, q) =>
          s.tradeName.toLowerCase().includes(q) ||
          (s.companyName ? s.companyName.toLowerCase().includes(q) : false) ||
          (s.legalName ? s.legalName.toLowerCase().includes(q) : false) ||
          s.cnpj.includes(q) ||
          (s.category ? s.category.toLowerCase().includes(q) : false)
        }
        pageSize={10}
      />

      {/* Supplier Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Cadastrar Novo Fornecedor Industrial"
          maxWidth="2xl"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nome Fantasia *</label>
                <input
                  type="text"
                  required
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  placeholder="Ex: SKF Rolamentos do Brasil"
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Razão Social *</label>
                <input
                  type="text"
                  required
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">CNPJ *</label>
                <input
                  type="text"
                  required
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Categoria de Fornecimento</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nome do Contato</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email Comercial</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Telefone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg border border-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors shadow-lg"
              >
                Salvar Fornecedor
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
