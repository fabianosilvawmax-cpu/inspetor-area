import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { motion } from 'motion/react';
import { Map as MapIcon } from 'lucide-react';
import L from 'leaflet';
import { InspectionState } from '../types';

interface MapViewProps {
  inspection: InspectionState | null;
  history: InspectionState[];
  selectedHistoryItem?: InspectionState | null;
  onBack: () => void;
}

// Component to handle map view updates (centering and fitting bounds)
function MapController({ inspection, history, selectedHistoryItem }: { inspection: InspectionState | null, history: InspectionState[], selectedHistoryItem?: InspectionState | null }) {
  const map = useMap();

  useEffect(() => {
    let points: { lat: number, lon: number }[] = [];

    if (selectedHistoryItem) {
      points = selectedHistoryItem.path;
    } else {
      const allPaths = [...history.map(h => h.path), inspection?.path].filter(Boolean) as { lat: number, lon: number }[][];
      points = allPaths.flat();
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lon]));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (inspection?.lastPosition) {
      map.setView([inspection.lastPosition.lat, inspection.lastPosition.lon], 16);
    }
  }, [inspection?.id, history.length, selectedHistoryItem?.id, map]);

  return null;
}

export const MapView: React.FC<MapViewProps> = ({ inspection, history, selectedHistoryItem, onBack }) => {
  // Create markers for start and end of path
  const pathMarkers = useMemo(() => {
    const item = selectedHistoryItem || inspection;
    if (!item || item.path.length === 0) return null;
    const start = item.path[0];
    const end = item.path[item.path.length - 1];
    return { start, end };
  }, [inspection?.path, selectedHistoryItem?.path]);

  const displayHistory = useMemo(() => {
    if (selectedHistoryItem) return [selectedHistoryItem];
    return history;
  }, [history, selectedHistoryItem]);

  const displayInspection = selectedHistoryItem ? null : inspection;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="h-[75vh] rounded-3xl overflow-hidden shadow-2xl border-4 border-white relative"
    >
      <MapContainer 
        center={[-26.48, -49.08]} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* History Paths (Executed Streets) - Rendered first (bottom layer) */}
        {displayHistory.map(item => item.path.length > 1 && (
          <Polyline 
            key={item.id} 
            positions={item.path.map(p => [p.lat, p.lon])} 
            color={selectedHistoryItem ? "#3b82f6" : "#10b981"} 
            weight={selectedHistoryItem ? 6 : 4} 
            opacity={selectedHistoryItem ? 0.9 : 0.4} 
            dashArray={selectedHistoryItem ? "" : "5, 10"}
          />
        ))}

        {/* Current Path - Rendered on top */}
        {displayInspection && displayInspection.path.length > 1 && (
          <Polyline 
            positions={displayInspection.path.map(p => [p.lat, p.lon])} 
            color="#3b82f6" 
            weight={6} 
            opacity={0.9} 
          />
        )}
        
        {/* Start and End Markers */}
        {pathMarkers && (
          <>
            <Marker position={[pathMarkers.start.lat, pathMarkers.start.lon]}>
              <Popup><span className="text-[10px] font-bold uppercase">Início</span></Popup>
            </Marker>
            {(inspection?.isActive || selectedHistoryItem) && (
              <Marker position={[pathMarkers.end.lat, pathMarkers.end.lon]}>
                <Popup><span className="text-[10px] font-bold uppercase">{selectedHistoryItem ? 'Fim' : 'Posição Atual'}</span></Popup>
              </Marker>
            )}
          </>
        )}

        {/* Issues Markers */}
        {[...displayHistory.flatMap(h => h.issues), ...(displayInspection?.issues || [])].map(issue => issue.location && (
          <Marker 
            key={issue.id} 
            position={[issue.location.lat, issue.location.lon]}
            icon={L.divIcon({
              className: 'custom-div-icon',
              html: `<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6]
            })}
          >
            <Popup>
              <div className="p-1 min-w-[120px]">
                <p className="text-[10px] font-black uppercase text-red-600 leading-tight">{issue.type}</p>
                <p className="text-[9px] font-bold text-black/40 mt-1">{issue.streetName}</p>
                {issue.photo && (
                  <img src={issue.photo} alt="Evidência" className="w-full h-20 object-cover rounded-lg mt-2 border border-black/5" />
                )}
                {issue.observation && (
                  <p className="text-[9px] text-black/60 mt-2 italic">"{issue.observation}"</p>
                )}
                <p className="text-[8px] text-black/20 mt-1">{new Date(issue.timestamp).toLocaleTimeString()}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapController inspection={inspection} history={history} selectedHistoryItem={selectedHistoryItem} />
      </MapContainer>
      
      {/* Overlay UI */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur p-3 rounded-2xl shadow-xl border border-black/5 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-[#3b82f6] rounded-full" />
            <span className="text-[9px] font-bold uppercase text-black/60">{selectedHistoryItem ? 'Trajeto Selecionado' : 'Trajeto Atual'}</span>
          </div>
          {!selectedHistoryItem && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-[#10b981] opacity-40 rounded-full border border-dashed border-[#10b981]" />
              <span className="text-[9px] font-bold uppercase text-black/60">Histórico</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-[9px] font-bold uppercase text-black/60">Ocorrências</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 right-6 bg-[#1E293B] text-white p-4 rounded-2xl shadow-2xl z-[1000] flex items-center justify-between border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            {selectedHistoryItem ? <MapIcon size={20} /> : <div className="w-2 h-2 rounded-full bg-white animate-ping" />}
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">{selectedHistoryItem ? 'Visualização' : 'Monitoramento'}</h4>
            <p className="text-xs font-bold">
              {selectedHistoryItem 
                ? `${selectedHistoryItem.activityType} - ${new Date(selectedHistoryItem.date).toLocaleDateString()}` 
                : (inspection?.isActive ? 'Vistoria em Andamento' : 'Visualizando Geral')}
            </p>
          </div>
        </div>
        <button 
          onClick={onBack} 
          className="bg-white text-[#1E293B] text-[10px] font-black px-6 py-3 rounded-xl uppercase tracking-widest active:scale-95 transition-all shadow-lg"
        >
          Voltar
        </button>
      </div>
    </motion.div>
  );
};
