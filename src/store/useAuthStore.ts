import { create } from 'zustand';
import axios from 'axios';

// API Base URL - match Rodney's server
export const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const api = axios.create({
  baseURL: BACKEND_URL,
});

// Rodney's exact enum mapping
export type Role = 'spotter' | 'collector' | 'admin';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  collectorId: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  
  setUser: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));