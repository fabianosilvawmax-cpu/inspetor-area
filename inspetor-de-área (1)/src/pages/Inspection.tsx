import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Pause, Play, PlusCircle, Camera, Plus, X } from 'lucide-react';
import { InspectionState } from '../types';

interface InspectionProps {
  inspection: InspectionState;
  setInspection: React.Dispatch<React.SetStateAction<InspectionState | null>>;
  onLogIssue: () => void;
  onComplete: () => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (idx: number) => void;
  onQuickInspection: () => void;
  isCompressing: boolean;
}

export const Inspection: React.FC<InspectionProps> = ({
  inspection,
  setInspection,
  onLogIssue,
  onComplete,
  onPhotoUpload,
  onRemovePhoto,
  onQuickInspection,
  isCompressing
}) => {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-md border border-black/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Localização Atual</p>
            <div className="flex items-center gap-2 text-emerald-600">
              <MapPin size={16} />
              <span className="font-bold text-sm truncate max-w-[200px]">{inspection.currentStreet}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Progresso</p>
            <p className="text-2xl font-black text-[#1E293B]">{((inspection.traveledDistance / inspection.targetDistance) * 100).toFixed(1)}%</p>
          </div>
        </div>
        
        <div className="h-3 bg-black/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-emerald-500" 
            animate={{ width: `${Math.min(100, (inspection.traveledDistance / inspection.targetDistance) * 100)}%` }} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-[#F8FAFC] p-3 rounded-xl border border-black/5">
            <p className="text-[9px] font-bold text-black/30 uppercase">Percorrido</p>
            <p className="text-lg font-bold">{inspection.traveledDistance.toFixed(3)} km</p>
          </div>
          <div className="bg-[#F8FAFC] p-3 rounded-xl border border-black/5">
            <p className="text-[9px] font-bold text-black/30 uppercase">Fatos</p>
            <p className="text-lg font-bold">{inspection.issues.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setInspection(p => p ? {...p, isActive: !p.isActive} : null)} 
          className={`py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${inspection.isActive ? 'bg-amber-100 text-amber-700' : 'bg-emerald-600 text-white'}`}
        >
          {inspection.isActive ? <><Pause size={20} /> Pausar</> : <><Play size={20} /> Retomar</>}
        </button>
        <button 
          onClick={onLogIssue} 
          className="bg-[#1E293B] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md"
        >
          <PlusCircle size={20} /> Fato
        </button>
      </div>

      <button 
        onClick={onQuickInspection} 
        className="w-full bg-emerald-50 text-emerald-700 border-2 border-emerald-500/20 font-bold py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider text-xs shadow-sm"
      >
        <Camera size={18} /> Inspeção de Campo
      </button>

      <button 
        onClick={onComplete} 
        className="w-full bg-white border-2 border-emerald-500 text-emerald-600 font-bold py-4 rounded-2xl hover:bg-emerald-50 transition-all"
      >
        Finalizar Vistoria
      </button>

      <div className="bg-white p-6 rounded-3xl shadow-md border border-black/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-emerald-500" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Evidências Fotográficas</h3>
          </div>
          <label className={`cursor-pointer ${isCompressing ? 'bg-black/20' : 'bg-emerald-500'} text-white p-2 rounded-full transition-colors shadow-lg shadow-emerald-200`}>
            {isCompressing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus size={20} />
            )}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              onChange={onPhotoUpload}
              disabled={isCompressing}
            />
          </label>
        </div>

        {inspection.photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {inspection.photos.map((photo, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={photo} alt={`Evidência ${idx + 1}`} className="w-full h-full object-cover" />
                <button 
                  onClick={() => onRemovePhoto(idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-black/5 rounded-2xl py-8 flex flex-col items-center justify-center text-black/30">
            <Camera size={32} strokeWidth={1} />
            <p className="text-xs mt-2 font-medium">Nenhuma foto capturada</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
