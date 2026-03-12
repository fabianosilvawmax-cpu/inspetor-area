import React from 'react';
import { User, X } from 'lucide-react';
import { UserAccount } from '../types';

interface UserListProps {
  users: UserAccount[];
  currentUser: UserAccount | null;
  onRemoveUser: (id: string) => void;
}

export const UserList: React.FC<UserListProps> = ({ users, currentUser, onRemoveUser }) => {
  return (
    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-hide pt-2">
      {users.map(u => (
        <div key={u.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-black/5">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${u.role === 'admin' ? 'bg-emerald-500' : 'bg-slate-400'}`}>
              <User size={14} />
            </div>
            <div>
              <p className="font-bold text-xs text-[#1E293B]">{u.username}</p>
              <p className="text-[9px] text-black/40 font-bold uppercase">{u.role === 'admin' ? 'Administrador' : 'Operador'}</p>
            </div>
          </div>
          {u.id !== '1' && u.id !== currentUser?.id && (
            <button onClick={() => onRemoveUser(u.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all">
              <X size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
