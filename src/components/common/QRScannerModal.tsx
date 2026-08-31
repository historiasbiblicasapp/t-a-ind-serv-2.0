import React, { useState } from 'react';
import { Modal } from './Modal';
import { useData } from '../../contexts/DataContext';
import { QrCode, Search, Cpu, ArrowRight, Camera } from 'lucide-react';
import { Equipment } from '../../types';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEquipment: (eq: Equipment) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectEquipment,
}) => {
  const { equipment } = useData();
  const [scannedCode, setScannedCode] = useState('');
  const [simulatedCamera, setSimulatedCamera] = useState(true);

  const matched = equipment.find(
    (e) =>
      e.code.toLowerCase() === scannedCode.trim().toLowerCase() ||
      e.serialNumber?.toLowerCase() === scannedCode.trim().toLowerCase() ||
      e.qrCodeData?.toLowerCase() === scannedCode.trim().toLowerCase()
  );

  const handleSimulateScan = (code: string) => {
    setScannedCode(code);
  };

  const handleConfirm = () => {
    if (matched) {
      onSelectEquipment(matched);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Scanner de QR Code & Código do Ativo"
      subtitle="Aponte a câmera para a tag do equipamento ou informe o código"
      maxWidth="md"
      icon={<QrCode className="w-5 h-5 text-amber-400" />}
    >
      <div className="space-y-5">
        {/* Camera Viewfinder Simulation */}
        <div className="relative aspect-video bg-slate-950 rounded-xl border-2 border-dashed border-amber-500/50 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
          {/* Animated Scanning Beam */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse shadow-lg shadow-amber-400/50" />

          <Camera className="w-10 h-10 text-amber-400 mb-2 opacity-80" />
          <p className="text-xs font-semibold text-slate-200">Visor de Leitura Ativo</p>
          <p className="text-[11px] text-slate-400 max-w-xs mt-1">
            Posicione o QR Code fixado na carcaça do equipamento dentro da área demarcada.
          </p>

          {/* Quick simulation tag buttons */}
          <div className="mt-4 flex flex-wrap justify-center gap-1.5 z-10">
            <span className="text-[10px] text-slate-400 w-full block">Tags de Exemplo (Clique para Testar):</span>
            {equipment.slice(0, 4).map((eq) => (
              <button
                key={eq.id}
                type="button"
                onClick={() => handleSimulateScan(eq.code)}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-amber-400 text-[10px] font-mono font-bold rounded border border-slate-700"
              >
                {eq.code}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Code Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Ou Digite o Código do Equipamento / Tag:
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Ex: CNC-001, PRE-004, TOR-002..."
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono font-bold focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Match Card */}
        {matched ? (
          <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{matched.name}</h4>
                  <p className="text-xs font-mono text-amber-400 font-bold">{matched.code}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {matched.status}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              {matched.company} • {matched.unit} • {matched.department}
            </p>

            <button
              onClick={handleConfirm}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors shadow-md"
            >
              <span>Abrir Ficha do Equipamento</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : scannedCode.trim() ? (
          <div className="p-3 text-center text-xs text-rose-400 bg-rose-950/20 border border-rose-900/40 rounded-lg">
            Nenhum equipamento encontrado com a tag &ldquo;{scannedCode}&rdquo;.
          </div>
        ) : null}
      </div>
    </Modal>
  );
};
