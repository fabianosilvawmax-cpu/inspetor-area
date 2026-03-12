import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import * as XLSX from 'xlsx';
import { Navigation, LogOut, Lock, AlertCircle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Types
import { InspectionState, UserAccount, LoggedIssue, Activity } from './types';

// Hooks
import { useLocalStorage } from './hooks/useLocalStorage';
import { useGPS } from './hooks/useGPS';

// Utils
import { toLocalISOString, getStreetName, formatMonth, calculateDistance } from './utils/calculateDistance';
import { exportHistoryToExcel, downloadTemplateExcel, downloadHistoryTemplate } from './utils/exportExcel';

// Components
import { BottomNav } from './components/BottomNav';
import { IssueModal } from './components/IssueModal';

// Supabase
import { supabase } from './supabase';

// Pages
import { Setup } from './pages/Setup';
import { Inspection } from './pages/Inspection';
import { History } from './pages/History';
import { MapView } from './pages/MapView';
import { Reports } from './pages/Reports';
import { Admin } from './pages/Admin';
import { InspecaoCampo } from './pages/InspecaoCampo';

// Constants
import { ACTIVITIES } from './constants';

// Fix Leaflet marker icon issue
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function App() {
  // State
  const [users, setUsers] = useLocalStorage<UserAccount[]>('vistoria_users', [{ id: '1', username: 'admin', password: '123', role: 'admin' }]);
  const [currentUser, setCurrentUser] = useLocalStorage<UserAccount | null>('current_user', null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('current_user'));
  const [loginData, setLoginData] = useState({ username: '', password: '' });
 
  const [technicianName, setTechnicianName] = useState(() => {
  try {
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user && user.username) {
        return user.username;
      }
    }
  } catch (e) {
    console.error("Erro lendo usuário do localStorage", e);
  }
  return localStorage.getItem('tech_name') || '';
});
  const [activities, setActivities] = useLocalStorage<Activity[]>('inspection_activities', ACTIVITIES);
  const [setup, setSetup] = useState({ activityType: activities[0]?.name || '', targetDistance: activities[0]?.target.toString() || '0' });
  const [inspection, setInspection] = useState<InspectionState | null>(null);
  const [history, setHistory] = useLocalStorage<InspectionState[]>('inspection_history', []);
  const [error, setError] = useState<string | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [view, setView] = useState<'setup' | 'active' | 'history' | 'map' | 'reports' | 'admin' | 'field_inspection'>('setup');
  const [newActivity, setNewActivity] = useState({ name: '', target: '' });
  const [newUserData, setNewUserData] = useState({ username: '', password: '', role: 'user' as 'admin' | 'user' });
  const [filterMonth, setFilterMonth] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });
  const [isCompressing, setIsCompressing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<InspectionState | null>(null);

  // Sync isLoggedIn with currentUser
  useEffect(() => {
    setIsLoggedIn(!!currentUser);
  }, [currentUser]);

  // Clear selected history item when not in map view
  useEffect(() => {
    if (view !== 'map') {
      setSelectedHistoryItem(null);
    }
  }, [view]);

  // Load active inspection
  useEffect(() => {
    const active = localStorage.getItem('active_inspection');
    if (active) {
      try {
        const parsed = JSON.parse(active);
        setInspection(parsed);
        if (parsed.isActive) setView('active');
      } catch (e) {
        console.error("Failed to load active inspection", e);
      }
    }
  }, []);

  // Persist active inspection
  useEffect(() => {
    if (inspection) {
      localStorage.setItem('active_inspection', JSON.stringify(inspection));
    } else {
      localStorage.removeItem('active_inspection');
    }
  }, [inspection]);

  // Fetch users from Supabase
  const fetchUsers = async () => {
    if (!supabase) return;
    
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error('Error fetching users from Supabase:', error);
      } else if (data && data.length > 0) {
        setUsers(data);
      }
    } catch (e) {
      console.error('Connection error with Supabase:', e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // GPS Hook
  const location = useGPS();

  // Handle Location Updates for Active Inspection
  useEffect(() => {
    if (location && inspection?.isActive && !inspection.isCompleted) {
      const { lat, lng } = location;
      
      const updateInspection = async () => {
        let street = inspection.currentStreet;
        if (!inspection.lastPosition || calculateDistance(inspection.lastPosition.lat, inspection.lastPosition.lon, lat, lng) > 0.05) {
           street = await getStreetName(lat, lng);
        }

        setInspection(prev => {
          if (!prev || !prev.isActive) return prev;

          let newDistance = prev.traveledDistance;
          if (prev.lastPosition) {
            const dist = calculateDistance(
              prev.lastPosition.lat,
              prev.lastPosition.lon,
              lat,
              lng
            );
            if (dist > 0.005) { // Only add distance if moved more than 5 meters
              newDistance += dist;
            }
          }

          return {
            ...prev,
            traveledDistance: newDistance,
            lastPosition: { lat, lon: lng },
            currentStreet: street,
            path: [...prev.path, { lat, lon: lng, timestamp: Date.now() }]
          };
        });
      };

      updateInspection();
    }
  }, [location, inspection?.isActive, inspection?.isCompleted]);

  // Auth Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === loginData.username && u.password === loginData.password);
    if (user) {
      setCurrentUser(user);
      setTechnicianName(user.username);
      setError(null);
    } else {
      setError("Usuário ou senha incorretos.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('setup');
  };

  // Inspection Handlers
  const startInspection = () => {
    if (!technicianName) {
      setError("Por favor, informe o nome do técnico.");
      return;
    }
    const target = parseFloat(setup.targetDistance);
    if (isNaN(target) || target <= 0) {
      setError("Distância alvo deve ser um número positivo.");
      return;
    }

    const newInspection: InspectionState = {
      id: Math.random().toString(36).substr(2, 9),
      technicianName,
      date: toLocalISOString(),
      activityType: setup.activityType,
      targetDistance: target,
      traveledDistance: 0,
      isActive: true,
      isCompleted: false,
      startTime: Date.now(),
      endTime: null,
      lastPosition: null,
      currentStreet: 'Aguardando GPS...',
      path: [],
      issues: [],
      photos: []
    };

    setInspection(newInspection);
    setView('active');
    setError(null);
  };

  const logIssue = async (issueType: string) => {
    if (!inspection) return;
    
    let street = inspection.currentStreet;
    if (inspection.lastPosition) {
      street = await getStreetName(inspection.lastPosition.lat, inspection.lastPosition.lon);
    }

    const newIssue: LoggedIssue = {
      id: Math.random().toString(36).substr(2, 9),
      type: issueType,
      timestamp: Date.now(),
      location: inspection.lastPosition,
      streetName: street
    };

    setInspection(prev => prev ? {
      ...prev,
      issues: [...prev.issues, newIssue]
    } : null);
    
    setShowIssueModal(false);
  };

 
const completeInspection = async () => {
  if (!inspection) return;

  const completed = {
    ...inspection,
    isCompleted: true,
    isActive: false,
    endTime: Date.now()
  };

  // salvar no histórico local
  setHistory(prev => [completed, ...prev]);

  // salvar no Supabase
  if (supabase) {
    try {
      await supabase
        .from("inspecoes")
        .insert([
          {
            tecnico: completed.technicianName,
            area: completed.activityType,
            poste: completed.currentStreet,
            servico: "vistoria",
            latitude: completed.lastPosition?.lat || null,
            longitude: completed.lastPosition?.lon || null,
            data: new Date().toISOString(),
            foto: completed.photos?.[0] || null
          }
        ]);
    } catch (error) {
      console.error("Erro ao salvar no Supabase:", error);
    }
  }

  setInspection(null);
  setView("history");
};
  const deleteHistoryItem = (id: string) => {
    if (currentUser?.role !== 'admin') return;
    if (window.confirm("Deseja realmente excluir este registro?")) {
      setHistory(prev => prev.filter(item => item.id !== id));
    }
  };

  const clearHistory = () => {
    if (currentUser?.role !== 'admin') return;
    if (confirmClear) {
      setHistory([]);
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  // Photo Handlers
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !inspection) return;

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const max = 800;
        if (width > height && width > max) {
          height *= max / width;
          width = max;
        } else if (height > max) {
          width *= max / height;
          height = max;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setInspection(prev => prev ? { ...prev, photos: [...prev.photos, dataUrl] } : null);
        setIsCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (idx: number) => {
    setInspection(prev => prev ? {
      ...prev,
      photos: prev.photos.filter((_, i) => i !== idx)
    } : null);
  };

  // Admin Handlers
  const addActivity = () => {
    if (!newActivity.name || !newActivity.target) return;
    const target = parseFloat(newActivity.target);
    if (isNaN(target) || target <= 0) return;
    setActivities(prev => [...prev, { name: newActivity.name, target }]);
    setNewActivity({ name: '', target: '' });
  };

  const removeActivity = (name: string) => {
    if (currentUser?.role !== 'admin') return;
    if (confirmDelete === name) {
      setActivities(prev => prev.filter(a => a.name !== name));
      setConfirmDelete(null);
    } else {
      setConfirmDelete(name);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const addUser = async () => {
    if (!newUserData.username || !newUserData.password) return;
    if (users.some(u => u.username === newUserData.username)) return;

    if (!supabase) {
      // Local fallback
      const newUser: UserAccount = {
        id: Math.random().toString(36).substr(2, 9),
        username: newUserData.username,
        password: newUserData.password,
        role: newUserData.role
      };
      setUsers(prev => [...prev, newUser]);
      setNewUserData({ username: '', password: '', role: 'user' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .insert([
          { 
            username: newUserData.username, 
            role: newUserData.role,
            password: newUserData.password 
          }
        ])
        .select();

      if (error) {
        console.error('Supabase error adding user:', error);
        setError(`Erro no banco de dados: ${error.message}`);
      } else if (data) {
        setUsers(prev => [...prev, data[0]]);
        setNewUserData({ username: '', password: '', role: 'user' });
      }
    } catch (e) {
      console.error('Unexpected error adding user:', e);
      setError("Erro inesperado ao conectar com o banco.");
    }
  };

  const removeUser = async (id: string) => {
    if (id === '1' || id === currentUser?.id) return;
    
    if (!supabase) {
      setUsers(prev => prev.filter(u => u.id !== id));
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error removing user:', error);
        setError(`Erro ao remover: ${error.message}`);
      } else {
        setUsers(prev => prev.filter(u => u.id !== id));
      }
    } catch (e) {
      console.error('Unexpected error removing user:', e);
      setError("Erro ao conectar com o banco.");
    }
  };

  // Excel Handlers
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentUser?.role !== 'admin') return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      const newActs = data.map((row: any) => ({
        name: row.Rede || row.Area || row.Nome,
        target: Number(row.Meta || row.Distancia) || 0
      })).filter(a => a.name && a.target > 0);
      setActivities(prev => [...prev, ...newActs]);
    };
    reader.readAsBinaryString(file);
  };

  const handleImportHistory = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentUser?.role !== 'admin') return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      const newHistoryEntries: InspectionState[] = [];
      const normalize = (name: string) => String(name).toUpperCase().replace(/^TOTAL DE\s+/i, '').trim();
      let importedCount = 0;
      let ignoredCount = 0;

      data.forEach((row: any) => {
        const activityNameRaw = row.Atividade || row.Rede || row.Area;
        if (!activityNameRaw) return;
        const activityNameNormalized = normalize(activityNameRaw);
        const existingActivity = activities.find(a => normalize(a.name) === activityNameNormalized);
        if (!existingActivity) {
          ignoredCount++;
          return;
        }

        const issuesList = row.Fatos || row.Ocorrencias || "";
        const issuesArray = String(issuesList).split(';').map(f => f.trim()).filter(f => f.length > 0);
        const dateRaw = row.Data || row.Data_Execucao;
        let dateObj: Date;
        
        if (typeof dateRaw === 'number') {
          dateObj = new Date((dateRaw - 25569) * 86400 * 1000);
        } else if (dateRaw) {
          dateObj = new Date(dateRaw);
          if (isNaN(dateObj.getTime())) {
            const parts = String(dateRaw).split(/[\/\-]/);
            if (parts.length === 3) dateObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          }
        } else {
          dateObj = new Date();
        }
        
        if (isNaN(dateObj.getTime())) dateObj = new Date();
        const km = Number(row.KM || row.Executado || row.Distancia) || 0;

        newHistoryEntries.push({
          id: `imp-${Math.random().toString(36).substr(2, 5)}`,
          technicianName: row.Tecnico || row.Funcionario || "Importado",
          date: toLocalISOString(dateObj),
          activityType: existingActivity.name,
          targetDistance: existingActivity.target,
          traveledDistance: km,
          isActive: false,
          isCompleted: true,
          startTime: dateObj.getTime(),
          endTime: dateObj.getTime() + 3600000,
          lastPosition: null,
          currentStreet: "Importado via Excel",
          path: [],
          issues: issuesArray.map(type => ({
            id: Math.random().toString(36).substr(2, 5),
            type,
            timestamp: dateObj.getTime(),
            location: null,
            streetName: "Importado"
          })),
          photos: []
        });
        importedCount++;
      });

      setHistory(prev => [...newHistoryEntries, ...prev]);
      let msg = `${importedCount} registros importados com sucesso!`;
      if (ignoredCount > 0) msg += ` ${ignoredCount} registros foram ignorados por não pertencerem às áreas pré-estabelecidas.`;
      alert(msg);
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Memos
  const filteredHistory = useMemo(() => {
    if (filterMonth === 'all') return history;
    return history.filter(item => item.date.startsWith(filterMonth));
  }, [history, filterMonth]);

  const accumulatedStats = useMemo(() => {
    return filteredHistory.reduce((acc, curr) => ({
      totalKm: acc.totalKm + curr.traveledDistance,
      totalIssues: acc.totalIssues + curr.issues.length,
      count: acc.count + 1
    }), { totalKm: 0, totalIssues: 0, count: 0 });
  }, [filteredHistory]);

  const months = useMemo(() => {
    const m = new Set<string>();
    history.forEach(item => m.add(item.date.substring(0, 7)));
    m.add(toLocalISOString().substring(0, 7));
    return Array.from(m).sort().reverse();
  }, [history]);

  const reportData = useMemo(() => {
    const issueCounts: Record<string, number> = {};
    const monthItems = filteredHistory;
    
    import('./constants').then(c => {
      c.COMMON_ISSUES.forEach(issue => { issueCounts[issue] = 0; });
    });

    monthItems.forEach(item => {
      item.issues.forEach(issue => {
        issueCounts[issue.type] = (issueCounts[issue.type] || 0) + 1;
      });
    });

    const sortedData = Object.entries(issueCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const total = sortedData.reduce((acc, curr) => acc + curr.value, 0);
    let cumulative = 0;

    return sortedData.map(item => {
      cumulative += item.value;
      return {
        ...item,
        pareto: total > 0 ? Math.round((cumulative / total) * 100) : 0
      };
    });
  }, [filteredHistory]);

  const areaProgress = useMemo(() => {
    return activities.map(activity => {
      const normalize = (name: string) => name.toUpperCase().replace(/^TOTAL DE\s+/i, '').trim();
      const activityNameNormalized = normalize(activity.name);
      const totalExecuted = history
        .filter(item => normalize(item.activityType) === activityNameNormalized)
        .reduce((sum, item) => sum + item.traveledDistance, 0);
      return { ...activity, executed: totalExecuted, percentage: activity.target > 0 ? (totalExecuted / activity.target) * 100 : 0 };
    });
  }, [history, activities]);

  // Render
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#1E293B] flex items-center justify-center p-6 font-sans">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/20">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-black text-[#1E293B] tracking-tight">VISTORIA PRO</h1>
            <p className="text-black/40 text-sm font-medium">Acesse sua conta para continuar</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Usuário</label>
              <input type="text" className="w-full bg-black/5 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium" placeholder="Ex: admin" value={loginData.username} onChange={e => setLoginData(prev => ({ ...prev, username: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-black/40">Senha</label>
              <input type="password" className="w-full bg-black/5 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium" placeholder="••••••••" value={loginData.password} onChange={e => setLoginData(prev => ({ ...prev, password: e.target.value }))} />
            </div>
            {error && <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2"><AlertCircle size={14} /> {error}</motion.div>}
            <button type="submit" className="w-full bg-[#1E293B] text-white font-bold py-5 rounded-2xl shadow-xl active:scale-[0.98] transition-all uppercase tracking-widest text-sm">Entrar no Sistema</button>
          </form>
          <p className="text-center text-[10px] text-black/20 font-bold uppercase tracking-widest">© 2026 Vistoria de Rede Pro</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans">
      <header className="bg-[#1E293B] text-white px-6 py-4 sticky top-0 z-[1000] shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white"><Navigation size={18} /></div>
            <h1 className="font-bold text-lg tracking-tight uppercase">Vistoria Pro</h1>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-full hover:bg-white/10 transition-colors"><LogOut size={20} className="text-white/60" /></button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-6 pb-32">
        <AnimatePresence mode="wait">
          {view === 'setup' && (
            <Setup 
              technicianName={technicianName} setTechnicianName={setTechnicianName} activities={activities} 
              setup={setup} setSetup={setSetup} onStart={startInspection} onManage={() => setView('admin')} 
              onImportExcel={handleImportExcel} onDownloadTemplate={downloadTemplateExcel} 
              onImportHistory={handleImportHistory} onDownloadHistoryTemplate={() => downloadHistoryTemplate(activities)} 
              error={error} currentUser={currentUser} 
            />
          )}
          {view === 'active' && inspection && (
            <Inspection 
              inspection={inspection} setInspection={setInspection} onLogIssue={() => setShowIssueModal(true)} 
              onComplete={completeInspection} onPhotoUpload={handlePhotoUpload} onRemovePhoto={removePhoto} 
              isCompressing={isCompressing} 
              onQuickInspection={() => setView('field_inspection')}
            />
          )}
          {view === 'history' && (
            <History 
              history={history} filteredHistory={filteredHistory} accumulatedStats={accumulatedStats} 
              filterMonth={filterMonth} setFilterMonth={setFilterMonth} months={months} 
              onExport={() => exportHistoryToExcel(history)} onDelete={deleteHistoryItem} currentUser={currentUser} 
              onViewOnMap={(item) => {
                setSelectedHistoryItem(item);
                setView('map');
              }}
            />
          )}
          {view === 'map' && (
            <MapView 
              inspection={inspection} 
              history={history} 
              selectedHistoryItem={selectedHistoryItem}
              onBack={() => {
                if (selectedHistoryItem) {
                  setSelectedHistoryItem(null);
                  setView('history');
                } else {
                  setView(inspection ? 'active' : 'setup');
                }
              }} 
            />
          )}
          {view === 'reports' && (
            <Reports 
              filterMonth={filterMonth} setFilterMonth={setFilterMonth} months={months} 
              reportData={reportData} areaProgress={areaProgress} onManage={() => setView('admin')} 
              currentUser={currentUser} 
            />
          )}
          {view === 'admin' && currentUser?.role === 'admin' && (
            <Admin 
              onBack={() => setView('reports')} newActivity={newActivity} setNewActivity={setNewActivity} 
              onAddActivity={addActivity} activities={activities} confirmDelete={confirmDelete} 
              onRemoveActivity={removeActivity} newUserData={newUserData} setNewUserData={setNewUserData} 
              onAddUser={addUser} users={users} currentUser={currentUser} onRemoveUser={removeUser} 
              onExportHistory={() => exportHistoryToExcel(history)} onClearHistory={clearHistory} confirmClear={confirmClear} 
              supabaseConnected={!!supabase}
            />
          )}
          {view === 'field_inspection' && (
            <InspecaoCampo 
              onBack={() => setView('active')} 
              onSave={async (data) => {
                if (!inspection) return;
                
                let street = inspection.currentStreet;
                if (data.latitude && data.longitude) {
                  street = await getStreetName(data.latitude, data.longitude);
                }

                const newIssue: LoggedIssue = {
                  id: Math.random().toString(36).substr(2, 9),
                  type: 'Inspeção de Campo',
                  timestamp: new Date(data.data).getTime(),
                  location: data.latitude && data.longitude ? { lat: data.latitude, lon: data.longitude } : inspection.lastPosition,
                  streetName: street,
                  photo: data.foto,
                  observation: data.observacao
                };

                setInspection(prev => prev ? {
                  ...prev,
                  issues: [...prev.issues, newIssue]
                } : null);
                
                setView('active');
              }}
            />
          )}
        </AnimatePresence>
      </main>

      <IssueModal show={showIssueModal} onClose={() => setShowIssueModal(false)} onLogIssue={logIssue} />
      <BottomNav view={view} setView={setView} hasActiveInspection={!!inspection} />
    </div>
  );
}
