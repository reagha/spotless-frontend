import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { useAuthStore, api } from './store/useAuthStore';
import CitizenReport from './pages/CitizenReport';
import AdminDashboard from './pages/AdminDashboard';
import CollectorView from './pages/CollectorView';
import Signup from './pages/Signup'; // Ensure you created this file in src/pages/
import { Loader2, Leaf } from 'lucide-react';

// --- ROUTE PROTECTOR ---
// Checks if user is logged in and has the right role for the page
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user, isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !allowedRoles.includes(user.role)) return <Navigate to="/report" replace />; 
  
  return <>{children}</>;
};

// --- LOGIN COMPONENT ---
const Login = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('citizen@spotless.com'); 
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Hits Rodney's fixed POST /auth endpoint
      const response = await api.post('/auth', { email, password });
      const user = response.data;
      
      setUser(user);

      // Automatic routing based on backend role
      if (user.role === 'admin') navigate('/dashboard');
      else if (user.role === 'collector') navigate('/collect');
      else navigate('/report');
      
    } catch (err: any) {
      // Friendly error handling for the user
      setError(err.response?.data?.message || 'Login failed. Check your connection or credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#2A835F] to-[#1B2CC1] p-4 font-sans">
      <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-white/20 animate-in fade-in zoom-in duration-300">
        
        {/* Branding Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#2A835F] p-3 rounded-2xl shadow-lg mb-3">
            <Leaf className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Spotless</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Keep Uganda Clean</p>
        </div>
        
        {/* Error Feedback */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-xs font-bold border border-red-100 animate-pulse text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full mt-1 p-3.5 border border-gray-100 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-[#1B2CC1] focus:bg-white outline-none transition-all" 
              placeholder="name@example.com"
            />
          </div>
          
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full mt-1 p-3.5 border border-gray-100 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-[#1B2CC1] focus:bg-white outline-none transition-all" 
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#2A835F] text-white font-black p-4 rounded-2xl hover:bg-[#226a4c] shadow-xl shadow-[#2A835F]/20 transition-all flex justify-center items-center gap-2 mt-4 disabled:bg-gray-300"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'SIGN IN'}
          </button>
        </form>

        {/* Signup Link */}
        <p className="text-center text-sm text-gray-500 mt-8 font-medium">
          Don't have an account? <br/>
          <Link to="/signup" className="text-[#1B2CC1] font-black hover:underline underline-offset-4">
            CREATE ACCOUNT
          </Link>
        </p>
      </div>
      
      {/* Small Legal/Branding footer */}
      <p className="mt-8 text-white/60 text-[10px] font-bold tracking-widest uppercase">
        © 2026 Spotless Uganda
      </p>
    </div>
  );
};

// --- MAIN ROUTER ---
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes - Role Based */}
        <Route path="/report" element={
          <ProtectedRoute allowedRoles={['spotter', 'admin']}>
            <CitizenReport />
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/collect" element={
          <ProtectedRoute allowedRoles={['collector', 'admin']}>
            <CollectorView />
          </ProtectedRoute>
        } />

        {/* Fallback to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}