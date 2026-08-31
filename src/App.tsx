import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import CitizenReport from './pages/CitizenReport'; 
import AdminDashboard from './pages/AdminDashboard';
import CollectorView from './pages/CollectorView';

// --- ROUTE PROTECTOR ---
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !allowedRoles.includes(user.role)) return <Navigate to="/report" replace />; 
  return <>{children}</>;
};

// --- TEMPORARY LOGIN PAGE FOR HACKATHON DEMO ---
const Login = () => {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = (role: 'CITIZEN' | 'ADMIN' | 'COLLECTOR', path: string) => {
    login(role);
    navigate(path);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-green-600 mb-8">WasteWise Uganda 🇺🇬</h1>
      <div className="space-y-4 flex flex-col w-64">
        <button onClick={() => handleLogin('CITIZEN', '/report')} className="p-3 bg-blue-500 text-white rounded-lg shadow font-semibold hover:bg-blue-600 transition">
          Login as Citizen
        </button>
        <button onClick={() => handleLogin('ADMIN', '/dashboard')} className="p-3 bg-purple-500 text-white rounded-lg shadow font-semibold hover:bg-purple-600 transition">
          Login as Admin
        </button>
        <button onClick={() => handleLogin('COLLECTOR', '/collect')} className="p-3 bg-orange-500 text-white rounded-lg shadow font-semibold hover:bg-orange-600 transition">
          Login as Collector
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Real Citizen Page */}
        <Route path="/report" element={
          <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
            <CitizenReport />
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/collect" element={
          <ProtectedRoute allowedRoles={['COLLECTOR', 'ADMIN']}>
            <CollectorView />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}