import React, { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Camera, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { PageWrapper } from "../components/PageWrapper";

interface InspecaoCampoProps {
  onBack: () => void;
  onSave: (data: { data: string; latitude: number | null; longitude: number | null; foto: string | null; observacao: string }) => void;
}

export const InspecaoCampo: React.FC<InspecaoCampoProps> = ({ onBack, onSave }) => {
  const [foto, setFoto] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [obs, setObs] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const capturarGPS = () => {
    if (!navigator.geolocation) {
      alert("GPS não suportado");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLoading(false);
      },
      () => {
        alert("Erro ao capturar GPS");
        setLoading(false);
      }
    );
  };

  const tirarFoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const salvarInspecao = () => {
    const data = {
      data: new Date().toISOString(),
      latitude,
      longitude,
      foto,
      observacao: obs
    };

    onSave(data);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <PageWrapper title="Inspeção de Campo">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="space-y-6"
      >
        <button 
          onClick={onBack}
          className="text-[10px] font-bold uppercase tracking-widest text-black/40 flex items-center gap-1 hover:text-black transition-colors"
        >
          ← Voltar para Vistoria
        </button>

        {/* GPS Section */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-black/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase tracking-wider text-black/60">Localização</h3>
            <button 
              onClick={capturarGPS}
              disabled={loading}
              className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              <MapPin size={14} />
              {loading ? "Capturando..." : "Capturar GPS"}
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/5 p-3 rounded-2xl">
              <p className="text-[9px] font-bold text-black/30 uppercase">Latitude</p>
              <p className="text-sm font-mono font-bold text-[#1E293B]">
                {latitude?.toFixed(6) || "---"}
              </p>
            </div>
            <div className="bg-black/5 p-3 rounded-2xl">
              <p className="text-[9px] font-bold text-black/30 uppercase">Longitude</p>
              <p className="text-sm font-mono font-bold text-[#1E293B]">
                {longitude?.toFixed(6) || "---"}
              </p>
            </div>
          </div>
        </div>

        {/* Photo Section */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-black/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase tracking-wider text-black/60">Evidência</h3>
            <label className="bg-[#1E293B] text-white p-2 rounded-xl cursor-pointer active:scale-95 transition-all">
              <Camera size={20} />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={tirarFoto}
                className="hidden"
              />
            </label>
          </div>

          {foto ? (
            <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-black/5">
              <img
                src={foto}
                alt="preview"
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setFoto(null)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg"
              >
                <AlertCircle size={14} />
              </button>
            </div>
          ) : (
            <div className="aspect-video rounded-2xl border-2 border-dashed border-black/5 flex flex-col items-center justify-center text-black/20">
              <Camera size={40} strokeWidth={1} />
              <p className="text-[10px] font-bold uppercase mt-2">Nenhuma foto capturada</p>
            </div>
          )}
        </div>

        {/* Observation Section */}
        <div className="bg-white rounded-3xl p-6 shadow-md border border-black/5 space-y-3">
          <h3 className="font-bold text-sm uppercase tracking-wider text-black/60">Observação</h3>
          <textarea
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Descreva os detalhes da inspeção..."
            className="w-full bg-black/5 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-sm min-h-[100px]"
          />
        </div>

        {/* Save Button */}
        <button 
          onClick={salvarInspecao}
          className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] ${
            success ? 'bg-emerald-500 text-white' : 'bg-[#1E293B] text-white'
          }`}
        >
          {success ? (
            <><CheckCircle2 size={20} /> Salvo com Sucesso</>
          ) : (
            <><Save size={20} /> Salvar Inspeção</>
          )}
        </button>
      </motion.div>
    </PageWrapper>
  );
};
