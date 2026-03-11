import * as XLSX from 'xlsx';
import { InspectionState, Activity } from '../types';
import { toLocalISOString } from './calculateDistance';

export const exportHistoryToExcel = (history: InspectionState[]) => {
  const data = history.map(item => ({
    ID: item.id,
    Data: new Date(item.date).toLocaleDateString(),
    Técnico: item.technicianName,
    Atividade: item.activityType,
    'Meta (KM)': item.targetDistance,
    'Percorrido (KM)': item.traveledDistance.toFixed(3),
    'Fatos Registrados': item.issues.length,
    'Lista de Fatos': item.issues.map(i => i.type).join('; '),
    'Data Execução': item.date
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Histórico");
  XLSX.writeFile(wb, `Historico_Vistorias_${toLocalISOString().split('T')[0]}.xlsx`);
};

export const downloadTemplateExcel = () => {
  const templateData = [
    { Rede: "REDE 01", Meta: 10.5 },
    { Rede: "REDE 02", Meta: 5.0 }
  ];
  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template_Metas");
  XLSX.writeFile(wb, "Template_Importar_Metas.xlsx");
};

export const downloadHistoryTemplate = (activities: Activity[]) => {
  const templateData = [
    { Data: "2026-03-01", Tecnico: "João Silva", Atividade: activities[0]?.name || "Atividade 1", KM: 12.5, Fatos: "NAP SEM ETIQUETA; SEM ADEQUAÇÃO" },
    { Data: "2026-03-02", Tecnico: "Maria Souza", Atividade: activities[1]?.name || "Atividade 2", KM: 8.2, Fatos: "SEM PLAQUETA" }
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template_Execucao");
  XLSX.writeFile(wb, "Template_Importar_Execucao.xlsx");
};
