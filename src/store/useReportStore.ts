import { create } from 'zustand';

// Expanded statuses for better tracking
export type ReportStatus = 'PENDING' | 'VERIFIED' | 'ASSIGNED' | 'COLLECTED';

export interface WasteReport {
  id: string;
  userId: string; // To know who reported it
  image: string;
  lat: number;
  lng: number;
  description?: string; // Optional
  category?: string;    // Optional
  status: ReportStatus;
  timestamp: string;
}

interface ReportState {
  reports: WasteReport[];
  addReport: (report: Omit<WasteReport, 'id' | 'status' | 'timestamp'>) => void;
  markCollected: (id: string) => void;
}

export const useReportStore = create<ReportState>((set) => ({
  reports: [],
  
  addReport: (newReport) => set((state) => ({
    reports: [
      {
        ...newReport,
        id: Math.random().toString(36).substring(7),
        status: 'PENDING', // All reports start as pending
        timestamp: new Date().toISOString(),
      },
      ...state.reports, // Put new reports at the top of the list!
    ]
  })),

  markCollected: (id) => set((state) => ({
    reports: state.reports.map((report) => 
      report.id === id ? { ...report, status: 'COLLECTED' } : report
    )
  })),
}));