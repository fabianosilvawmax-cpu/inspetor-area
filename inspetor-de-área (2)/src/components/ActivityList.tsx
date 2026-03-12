import React from 'react';
import { X } from 'lucide-react';
import { Activity } from '../types';

interface ActivityListProps {
  activities: Activity[];
  confirmDelete: string | null;
  onRemoveActivity: (name: string) => void;
}

export const ActivityList: React.FC<ActivityListProps> = ({ activities, confirmDelete, onRemoveActivity }) => {
  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
      {activities.length === 0 ? (
        <div className="text-center py-4 text-black/20 text-[10px] font-bold uppercase">Nenhuma área cadastrada</div>
      ) : (
        activities.map((act) => (
          <div key={act.name} className="flex items-center justify-between p-3 bg-black/[0.02] rounded-xl border border-black/5">
            <div className="truncate pr-2">
              <p className="font-bold text-xs text-[#1E293B] truncate">{act.name}</p>
              <p className="text-[10px] text-black/40 font-medium">{act.target} KM</p>
            </div>
            <button 
              onClick={() => onRemoveActivity(act.name)}
              className={`p-2 rounded-lg transition-all flex items-center gap-1 ${confirmDelete === act.name ? 'bg-red-500 text-white text-[8px] font-bold px-3' : 'text-red-400 hover:bg-red-50'}`}
            >
              {confirmDelete === act.name ? 'CONFIRMAR?' : <X size={16} />}
            </button>
          </div>
        ))
      )}
    </div>
  );
};
