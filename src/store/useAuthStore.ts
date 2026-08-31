import { create } from 'zustand';

// The different roles in our system
type Role = 'CITIZEN' | 'ADMIN' | 'COLLECTOR';

interface User {
  id: string;
  name: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: Role) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // We start as NOT logged in
  user: null,
  isAuthenticated: false,
  
  // A fake login function so we can test the different views instantly
  login: (role) => set({ 
    user: { id: '123', name: 'Test User', role }, 
    isAuthenticated: true 
  }),
  
  logout: () => set({ user: null, isAuthenticated: false }),
}));