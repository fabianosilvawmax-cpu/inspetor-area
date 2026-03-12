import React from 'react';
import { Download, Filter, Calendar, X, Map as MapIcon } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import { InspectionState, UserAccount } from '../types';
import { formatMonth } from '../utils/calculateDistance';

interface HistoryProps {
  history: InspectionState[];
  filteredHistory: InspectionState[];
  accumulatedStats: { totalKm: number; totalIssues: number; count: number };
  filterMonth: string;
  setFilterMonth: (month: string) => void;
  months: string[];
  onExport: () => void;
  onDelete: (id: string) => void;
  onViewOnMap: (item: InspectionState) => void;
  currentUser: UserAccount | null;
}

export const History: React.FC<HistoryProps> = ({
  history,
  filteredHistory,
  accumulatedStats,
  filterMonth,
  setFilterMonth,
  months,
  onExport,
  onDelete,
  onViewOnMap,
  currentUser
}) => {
  return (
    <PageWrapper 
      title="Histórico" 
      rightElement={
        <div className="flex items-center gap-2">
          <button 
            onClick={onExport}
            className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all"
            title="Exportar para Excel"
          >
            <Download size={18} />
          </button>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-black/5 shadow-sm">
            <Filter size={14} className="text-black/30" />
            <select 
              className="bg-transparent text-xs font-bold outline-none" 
              value={filterMonth} 
              onChange={e => setFilterMonth(e.target.value)}
            >
              <option value="all">Acumulado</option>
              {months.map(m => <option key={m} value={m}>{formatMonth(m)}</option>)}
            </select>
          </div>
        </div>
      }
    >
      <div className="bg-[#1E293B] text-white rounded-3xl p-6 shadow-lg grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[8px] uppercase font-bold text-white/40 mb-1">Total KM</p>
          <p className="text-lg font-black">{accumulatedStats.totalKm.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[8px] uppercase font-bold text-white/40 mb-1">Total Fatos</p>
          <p className="text-lg font-black">{accumulatedStats.totalIssues}</p>
        </div>
        <div>
          <p className="text-[8px] uppercase font-bold text-white/40 mb-1">Vistorias</p>
          <p className="text-lg font-black">{accumulatedStats.count}</p>
        </div>
      </div>

      <div className="space-y-3">
        {filteredHistory.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-black/5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-black/20" />
                <span className="text-xs font-bold text-black/60">{new Date(item.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase">{item.traveledDistance.toFixed(2)} km</span>
                {currentUser?.role === 'admin' && (
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="p-1 text-red-400 hover:bg-red-50 rounded-lg transition-all"
                    title="Excluir Registro"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
            
            {item.photos && item.photos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {item.photos.map((photo, pIdx) => (
                  <img 
                    key={pIdx} 
                    src={photo} 
                    alt="Evidência" 
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-black/5"
                  />
                ))}
              </div>
            )}

            <div>
              <p className="font-bold text-sm text-[#1E293B] truncate">{item.activityType}</p>
              <p className="text-[10px] text-black/40 font-medium uppercase tracking-wider">{item.technicianName}</p>
            </div>

            {item.issues.some(i => i.photo || i.observation) && (
              <div className="space-y-2 border-t border-black/5 pt-2">
                <p className="text-[9px] font-bold text-black/30 uppercase">Detalhes dos Fatos</p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {item.issues.filter(i => i.photo || i.observation).map(issue => (
                    <div key={issue.id} className="flex-shrink-0 w-32 bg-black/5 rounded-xl p-2 space-y-1.5 border border-black/5">
                      {issue.photo && (
                        <img src={issue.photo} alt="Fato" className="w-full h-16 object-cover rounded-lg" />
                      )}
                      <p className="text-[8px] font-black uppercase text-red-600 truncate">{issue.type}</p>
                      {issue.observation && (
                        <p className="text-[8px] text-black/60 line-clamp-2 italic leading-tight">"{issue.observation}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-black/5">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  {item.issues.slice(0, 3).map((_, i) => (
                    <div key={i} className="w-5 h-5 rounded-full bg-red-100 border-2 border-white flex items-center justify-center text-[8px] text-red-600 font-bold">!</div>
                  ))}
                </div>
                <span className="text-[10px] font-bold text-black/30">{item.issues.length} fatos registrados</span>
              </div>
              <button 
                onClick={() => onViewOnMap(item)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E293B] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider active:scale-95 transition-all"
              >
                <MapIcon size={12} />
                Ver Trajeto
              </button>
            </div>
          </div>
        ))}
      </div>
    </PageWrapper>
  );
};
