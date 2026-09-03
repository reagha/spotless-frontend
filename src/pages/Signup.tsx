import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, useAuthStore } from '../store/useAuthStore';
import { Loader2, Leaf, ArrowLeft } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'spotter' // Default to citizen
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const setUser = useAuthStore(state => state.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create the user
      const res = await api.post('/users', formData);
      
      // 2. Automatically log them in after signup
      setUser(res.data);
      navigate('/report');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Email might already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#2A835F] to-[#1B2CC1] p-4">
      <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/20">
        <Link to="/login" className="flex items-center gap-1 text-gray-400 hover:text-[#2A835F] text-xs font-bold mb-6 transition-colors">
          <ArrowLeft size={14} /> BACK TO LOGIN
        </Link>

        <div className="flex flex-col items-center mb-6">
          <div className="bg-[#2A835F] p-3 rounded-full shadow-lg mb-2">
            <Leaf className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-gray-800">Join Spotless</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">Help keep your community clean</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-xs font-bold border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
              <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
                className="w-full mt-1 p-3 border border-gray-100 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#2A835F] outline-none" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
              <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
                className="w-full mt-1 p-3 border border-gray-100 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#2A835F] outline-none" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full mt-1 p-3 border border-gray-100 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#2A835F] outline-none" />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full mt-1 p-3 border border-gray-100 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#2A835F] outline-none" />
          </div>

          <button type="submit" disabled={loading} 
            className="w-full bg-[#2A835F] text-white font-black p-4 rounded-xl hover:bg-[#226a4c] shadow-xl transition-all flex justify-center items-center gap-2 mt-4">
            {loading ? <Loader2 className="animate-spin" /> : 'CREATE ACCOUNT'}
          </button>
        </form>
      </div>
    </div>
  );
}