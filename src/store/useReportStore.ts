import { create } from 'zustand';

export interface WasteReport {
  id: string;
  image: string; // Base64 image
  lat: number;
  lng: number;
  status: 'PENDING' | 'COLLECTED';
  timestamp: string;
}

interface ReportState {
  reports: WasteReport[];
  addReport: (report: Omit<WasteReport, 'id' | 'status' | 'timestamp'>) => void;
  markCollected: (id: string) => void; // <--- NEW FUNCTION
}

export const useReportStore = create<ReportState>((set) => ({
  reports: [],
  
  addReport: (newReport) => set((state) => ({
    reports: [
      ...state.reports,
      {
        ...newReport,
        id: Math.random().toString(36).substring(7),
        status: 'PENDING',
        timestamp: new Date().toISOString(),
      }
    ]
  })),

  // --- NEW FUNCTION: Finds the report and changes its status ---
  markCollected: (id) => set((state) => ({
    reports: state.reports.map((report) => 
      report.id === id ? { ...report, status: 'COLLECTED' } : report
    )
  })),
}));