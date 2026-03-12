import React from 'react';
import { Navigation, ClipboardList, Map as MapIcon, BarChart3 } from 'lucide-react';

interface BottomNavProps {
  view: string;
  setView: (view: any) => void;
  hasActiveInspection: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({ view, setView, hasActiveInspection }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-black/5 px-6 py-4 z-[1000]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        <button 
          onClick={() => setView(hasActiveInspection ? 'active' : 'setup')} 
          className={`flex flex-col items-center gap-1.5 ${view === 'active' || view === 'setup' ? 'text-[#1E293B]' : 'text-black/20'}`}
        >
          <Navigation size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Vistoria</span>
        </button>
        <button 
          onClick={() => setView('history')} 
          className={`flex flex-col items-center gap-1.5 ${view === 'history' ? 'text-[#1E293B]' : 'text-black/20'}`}
        >
          <ClipboardList size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Histórico</span>
        </button>
        <button 
          onClick={() => setView('map')} 
          className={`flex flex-col items-center gap-1.5 ${view === 'map' ? 'text-[#1E293B]' : 'text-black/20'}`}
        >
          <MapIcon size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Mapa</span>
        </button>
        <button 
          onClick={() => setView('reports')} 
          className={`flex flex-col items-center gap-1.5 ${view === 'reports' ? 'text-[#1E293B]' : 'text-black/20'}`}
        >
          <BarChart3 size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Relatórios</span>
        </button>
      </div>
    </nav>
  );
};
