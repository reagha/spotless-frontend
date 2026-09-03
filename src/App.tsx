import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore, api } from './store/useAuthStore';
import CitizenReport from './pages/CitizenReport';
import AdminDashboard from './pages/AdminDashboard';
import CollectorView from './pages/CollectorView';
import { Loader2, Leaf } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !allowedRoles.includes(user.role)) return <Navigate to="/report" replace />; 
  return <>{children}</>;
};

const Login = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('ada@example.com'); 
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {

      console.log("Attempting login for:", email);
  
  const fakeUsers: Record<string, any> = {
    'admin2@spotless.com': { id: 'admin-id', firstName: 'Admin', role: 'admin' },
    'citizen@spotless.com': { id: 'citizen-id', firstName: 'Ada', role: 'spotter' },
    'driver@spotless.com': { id: 'driver-id', firstName: 'Truck', role: 'collector' }
  };

  if (fakeUsers[email]) {
    setTimeout(() => {
      setUser(fakeUsers[email]);
      if (fakeUsers[email].role === 'admin') navigate('/dashboard');
      else if (fakeUsers[email].role === 'collector') navigate('/collect');
      else navigate('/report');
      setLoading(false);
    }, 800); // Fake a little loading time
    return;
  }

      const response = await api.post('/auth', { email, password });
      const user = response.data;
      setUser(user);
      if (user.role === 'admin') navigate('/dashboard');
      else if (user.role === 'collector') navigate('/collect');
      else navigate('/report');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#2A835F] to-[#1B2CC1] p-4">
      <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-white/20">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#2A835F] p-3 rounded-full shadow-lg mb-3">
            <Leaf className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Spotless</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Keep Uganda Clean</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-semibold border border-red-100">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
              className="w-full mt-1 p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#1B2CC1] focus:border-transparent outline-none transition-all" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required 
              className="w-full mt-1 p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#1B2CC1] focus:border-transparent outline-none transition-all" />
          </div>
          
          <button type="submit" disabled={loading} 
            className="w-full bg-[#2A835F] text-white font-bold p-4 rounded-xl hover:bg-[#226a4c] hover:shadow-lg transition-all flex justify-center items-center gap-2 mt-2">
            {loading ? <Loader2 className="animate-spin" /> : 'Sign In securely'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/report" element={<ProtectedRoute allowedRoles={['spotter', 'admin']}><CitizenReport /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/collect" element={<ProtectedRoute allowedRoles={['collector', 'admin']}><CollectorView /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}