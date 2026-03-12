import React from 'react';
import { motion } from 'motion/react';
import { Settings, Filter, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Line,
  ComposedChart,
  LabelList
} from 'recharts';
import { PageWrapper } from '../components/PageWrapper';
import { UserAccount, Activity } from '../types';
import { formatMonth } from '../utils/calculateDistance';

interface ReportsProps {
  filterMonth: string;
  setFilterMonth: (month: string) => void;
  months: string[];
  reportData: any[];
  areaProgress: any[];
  onManage: () => void;
  currentUser: UserAccount | null;
}

export const Reports: React.FC<ReportsProps> = ({
  filterMonth,
  setFilterMonth,
  months,
  reportData,
  areaProgress,
  onManage,
  currentUser
}) => {
  return (
    <PageWrapper 
      title="Relatórios" 
      rightElement={
        <div className="flex items-center gap-2">
          {currentUser?.role === 'admin' && (
            <button 
              onClick={onManage}
              className="p-2 bg-[#1E293B] text-white rounded-xl shadow-lg hover:bg-slate-700 transition-all"
              title="Gerenciar Atividades"
            >
              <Settings size={18} />
            </button>
          )}
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
      <div className="bg-white rounded-3xl p-6 shadow-md border border-black/5 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-500" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Pareto de Fatos (Top 5)</h3>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={reportData} margin={{ top: 20, right: 20, bottom: 60, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 8, fontWeight: 600, fill: '#64748b' }} 
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar yAxisId="left" dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30}>
                  <LabelList dataKey="value" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#1E293B' }} />
                  {reportData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#3b82f6' : '#e2e8f0'} />
                  ))}
                </Bar>
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="pareto" 
                  stroke="#f97316" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-[#1E293B] text-white p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <PieChartIcon size={18} className="text-emerald-400" />
          <h3 className="font-bold text-sm uppercase tracking-wider">Distribuição de Atividades</h3>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={reportData.slice(0, 5)}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {reportData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {reportData.slice(0, 4).map((item, i) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][i] }} />
              <span className="text-[9px] font-bold uppercase text-white/60 truncate">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};
