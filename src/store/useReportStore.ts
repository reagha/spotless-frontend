import { create } from 'zustand';

// Added IN_PROGRESS and ISSUE_REPORTED
export type ReportStatus = 'PENDING' | 'VERIFIED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COLLECTED' | 'REJECTED' | 'ISSUE_REPORTED';
export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface WasteReport {
  id: string;
  userId: string;
  image: string;
  lat: number;
  lng: number;
  description?: string;
  category?: string;
  status: ReportStatus;
  timestamp: string;
  aiReason?: string;
  assignedTo?: string;
  severity?: SeverityLevel;
  // New Collector Fields
  proofImage?: string;
  issueReason?: string;
}

interface ReportState {
  reports: WasteReport[];
  addReport: (report: Omit<WasteReport, 'id' | 'status' | 'timestamp'>) => void;
  startCollection: (id: string) => void;
  markCollected: (id: string, proofImage: string) => void;
  reportIssue: (id: string, reason: string) => void;
}

export const useReportStore = create<ReportState>((set) => ({
  reports: [],
  
  addReport: (newReport) => {
    const newId = Math.random().toString(36).substring(7);
    set((state) => ({
      reports: [
        { ...newReport, id: newId, status: 'PENDING', timestamp: new Date().toISOString() },
        ...state.reports,
      ]
    }));

    // AI SIMULATION (Auto-Assigns to Truck 02)
    setTimeout(() => {
      set((state) => ({
        reports: state.reports.map(r => {
          if (r.id !== newId) return r;
          if (!r.category) return { ...r, status: 'REJECTED', aiReason: "AI Confidence Low: No identifiable waste." };
          
          let calculatedSeverity: SeverityLevel = 'LOW';
          if (r.category === 'Mixed' || r.category === 'Electronic') calculatedSeverity = 'CRITICAL';
          else if (r.category === 'Plastic') calculatedSeverity = 'HIGH';
          else if (r.category === 'Organic') calculatedSeverity = 'MEDIUM';

          return { ...r, status: 'ASSIGNED', assignedTo: 'Truck 02', severity: calculatedSeverity };
        })
      }));
    }, 4000);
  },

  // COLLECTOR FUNCTIONS
  startCollection: (id) => set((state) => ({
    reports: state.reports.map(r => r.id === id ? { ...r, status: 'IN_PROGRESS' } : r)
  })),

  markCollected: (id, proofImage) => set((state) => ({
    reports: state.reports.map(r => r.id === id ? { ...r, status: 'COLLECTED', proofImage } : r)
  })),

  reportIssue: (id, reason) => set((state) => ({
    reports: state.reports.map(r => r.id === id ? { ...r, status: 'ISSUE_REPORTED', issueReason: reason } : r)
  })),
}));