import React from 'react';
import { User, Settings, Play, Upload, Download, FileSpreadsheet, AlertCircle, Camera } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import { UserAccount, Activity } from '../types';

interface SetupProps {
  technicianName: string;
  setTechnicianName: (name: string) => void;
  activities: Activity[];
  setup: { activityType: string; targetDistance: string };
  setSetup: React.Dispatch<React.SetStateAction<{ activityType: string; targetDistance: string }>>;
  onStart: () => void;
  onManage: () => void;
  onImportExcel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTemplate: () => void;
  onImportHistory: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadHistoryTemplate: () => void;
  error: string | null;
  currentUser: UserAccount | null;
}

export const Setup: React.FC<SetupProps> = ({
  technicianName,
  setTechnicianName,
  activities,
  setup,
  setSetup,
  onStart,
  onManage,
  onImportExcel,
  onDownloadTemplate,
  onImportHistory,
  onDownloadHistoryTemplate,
  error,
  currentUser
}) => {
  return (
    <PageWrapper title="Bem-vindo" subtitle="Configure sua jornada de vistoria hoje.">
      <div className="bg-white rounded-2xl p-6 shadow-md border border-black/5 space-y-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-black/40 flex items-center gap-1">
            <User size={10} /> Técnico Responsável
          </label>
          <input 
            type="text" 
            placeholder="Seu nome completo"
            className="w-full bg-black/5 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
            value={technicianName}
            onChange={e => setTechnicianName(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Área / Rede</label>
            {currentUser?.role === 'admin' && (
              <button 
                onClick={onManage}
                className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1 hover:underline"
              >
                <Settings size={10} /> Gerenciar
              </button>
            )}
          </div>
          <select 
            className="w-full bg-black/5 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none font-medium"
            value={setup.activityType}
            onChange={e => {
              const selected = activities.find(a => a.name === e.target.value);
              setSetup(s => ({ 
                ...s, 
                activityType: e.target.value,
                targetDistance: selected ? selected.target.toString() : s.targetDistance
              }));
            }}
          >
            {activities.map(act => <option key={act.name} value={act.name}>{act.name}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Meta do Dia (KM)</label>
          <input 
            type="number" 
            placeholder="0.00"
            className="w-full bg-black/5 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
            value={setup.targetDistance}
            onChange={e => setSetup(s => ({ ...s, targetDistance: e.target.value }))}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          <button 
            onClick={onStart} 
            className="w-full bg-[#1E293B] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Play size={18} fill="currentColor" /> Iniciar Vistoria
          </button>
          
          {currentUser?.role === 'admin' && (
            <div className="grid grid-cols-2 gap-2">
              <label className="border-2 border-dashed border-black/10 text-black/40 font-bold py-3 rounded-xl transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-1 uppercase tracking-widest text-[8px] cursor-pointer hover:bg-black/5 text-center">
                <Upload size={14} /> 
                <span>Importar Metas</span>
                <input type="file" accept=".xlsx, .xls" className="hidden" onChange={onImportExcel} />
              </label>

              <button 
                onClick={onDownloadTemplate}
                className="border-2 border-dashed border-black/10 text-black/40 font-bold py-3 rounded-xl transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-1 uppercase tracking-widest text-[8px] hover:bg-black/5 text-center"
              >
                <Download size={14} />
                <span>Exemplo Metas</span>
              </button>

              <label className="border-2 border-dashed border-emerald-500/20 text-emerald-600/60 font-bold py-3 rounded-xl transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-1 uppercase tracking-widest text-[8px] cursor-pointer hover:bg-emerald-50 text-center">
                <FileSpreadsheet size={14} /> 
                <span>Importar Execução</span>
                <input type="file" accept=".xlsx, .xls" className="hidden" onChange={onImportHistory} />
              </label>

              <button 
                onClick={onDownloadHistoryTemplate}
                className="border-2 border-dashed border-emerald-500/20 text-emerald-600/60 font-bold py-3 rounded-xl transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-1 uppercase tracking-widest text-[8px] hover:bg-emerald-50 text-center"
              >
                <Download size={14} />
                <span>Exemplo Execução</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};
