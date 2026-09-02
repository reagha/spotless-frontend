import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { BACKEND_URL } from './useAuthStore';

export interface AnalyticsSnapshot {
  generatedAt: string;
  live: {
    points: any[];
    activeCases: any[];
    routes: any[];
  };
  cases: {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    verified: number;
    unverified: number;
    unassigned: number;
    openedLast24h: number;
    openedLast7d: number;
    avgResolutionHours: number | null;
  };
  waste: {
    totalDetections: number;
    totalQuantity: number;
    byType: any[];
    byHazardLevel: Record<string, number>;
  };
}

interface AnalyticsState {
  snapshot: AnalyticsSnapshot | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

let socket: Socket | null = null;

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  snapshot: null,
  isConnected: false,

  connect: () => {
    if (socket) return;
    // Connect to Rodney's backend
   socket = io(BACKEND_URL);

    socket.on('connect', () => set({ isConnected: true }));
    socket.on('disconnect', () => set({ isConnected: false }));
    
    // Receive the live data push!
    socket.on('analytics:snapshot', (data: AnalyticsSnapshot) => {
      set({ snapshot: data });
    });
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }
}));