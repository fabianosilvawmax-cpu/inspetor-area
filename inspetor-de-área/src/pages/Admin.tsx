import React from 'react';
import { PlusCircle, ClipboardList, BarChart3, Download, RotateCcw, User, X } from 'lucide-react';
import { PageWrapper } from '../components/PageWrapper';
import Section from '../components/Section';
import { UserList } from '../components/UserList';
import { ActivityList } from '../components/ActivityList';
import { Activity, UserAccount } from '../types';

interface AdminProps {
  onBack: () => void;
  newActivity: { name: string; target: string };
  setNewActivity: React.Dispatch<React.SetStateAction<{ name: string; target: string }>>;
  onAddActivity: () => void;
  activities: Activity[];
  confirmDelete: string | null;
  onRemoveActivity: (name: string) => void;
  newUserData: { username: string; password: '', role: 'admin' | 'user' };
  setNewUserData: React.Dispatch<React.SetStateAction<{ username: string; password: '', role: 'admin' | 'user' }>>;
  onAddUser: () => void;
  users: UserAccount[];
  currentUser: UserAccount | null;
  onRemoveUser: (id: string) => void;
  onExportHistory: () => void;
  onClearHistory: () => void;
  confirmClear: boolean;
}

const primaryButton = "w-full bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-200 active:scale-95 transition-all uppercase text-xs tracking-widest";
const inputStyle = "w-full bg-black/5 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-sm";

export const Admin: React.FC<AdminProps> = ({
  onBack,
  newActivity,
  setNewActivity,
  onAddActivity,
  activities,
  confirmDelete,
  onRemoveActivity,
  newUserData,
  setNewUserData,
  onAddUser,
  users,
  currentUser,
  onRemoveUser,
  onExportHistory,
  onClearHistory,
  confirmClear
}) => {
  const setRole = (role: 'admin' | 'user') => {
    setNewUserData(prev => ({
      ...prev,
      role
    }));
  };

  return (
    <PageWrapper title="Gerenciar" rightElement={<button onClick={onBack} className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Voltar</button>}>
      <div className="bg-white rounded-3xl p-6 shadow-md border border-black/5 space-y-6">
        <Section title="Gerenciar Usuários" icon={<User size={16} className="text-emerald-500" />}>
          <div className="space-y-3 bg-black/[0.02] p-4 rounded-2xl border border-black/5">
            <input 
              type="text" 
              placeholder="Nome de Usuário"
              className={inputStyle}
              value={newUserData.username}
              onChange={e => setNewUserData(prev => ({ ...prev, username: e.target.value }))}
            />
            <input 
              type="password" 
              placeholder="Senha"
              className={inputStyle}
              value={newUserData.password}
              onChange={e => setNewUserData(prev => ({ ...prev, password: e.target.value as any }))}
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setRole('user')}
                className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${newUserData.role === 'user' ? 'bg-[#1E293B] text-white' : 'bg-black/5 text-black/40'}`}
              >
                Usuário Simples
              </button>
              <button 
                onClick={() => setRole('admin')}
                className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${newUserData.role === 'admin' ? 'bg-emerald-500 text-white' : 'bg-black/5 text-black/40'}`}
              >
                Administrador
              </button>
            </div>
            <button 
              onClick={onAddUser}
              className={primaryButton}
            >
              Criar Usuário
            </button>
          </div>

          <UserList users={users} currentUser={currentUser} onRemoveUser={onRemoveUser} />
        </Section>

        <Section title="Adicionar Área/Rede" icon={<PlusCircle size={16} className="text-emerald-500" />}>
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Nome da Rede/Área"
              className={inputStyle}
              value={newActivity.name}
              onChange={e => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
            />
            <input 
              type="number" 
              placeholder="Meta (KM)"
              className={inputStyle}
              value={newActivity.target}
              onChange={e => setNewActivity(prev => ({ ...prev, target: e.target.value }))}
            />
            <button 
              onClick={onAddActivity}
              className={primaryButton}
            >
              Adicionar
            </button>
          </div>
        </Section>

        <Section title="Áreas Atuais" icon={<ClipboardList size={16} className="text-emerald-500" />}>
          <ActivityList activities={activities} confirmDelete={confirmDelete} onRemoveActivity={onRemoveActivity} />
        </Section>

        <Section title="Relatórios e Dados" icon={<BarChart3 size={16} className="text-emerald-500" />}>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={onExportHistory}
              className="w-full bg-[#1E293B] text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
            >
              <Download size={16} /> Exportar Relatório Geral
            </button>
            <button 
              onClick={onClearHistory}
              className={`w-full border-2 font-bold py-3 rounded-xl transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2 ${confirmClear ? 'bg-red-500 border-red-500 text-white' : 'border-red-100 text-red-500 hover:bg-red-50'}`}
            >
              <RotateCcw size={16} /> {confirmClear ? 'CONFIRMAR LIMPEZA TOTAL?' : 'Limpar Todo Histórico'}
            </button>
          </div>
        </Section>
      </div>
    </PageWrapper>
  );
};
