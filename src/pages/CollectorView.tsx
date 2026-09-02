import { useState, useEffect, useRef } from 'react';
import { useAuthStore, api } from '../store/useAuthStore';
import { LogOut, Navigation, CheckCircle, Play, Camera,  Loader2, MapPin } from 'lucide-react';
import { BACKEND_URL } from '../store/useAuthStore';

export default function CollectorView() {
  const logout = useAuthStore((state) => state.logout);
  const [activeTab, setActiveTab] = useState<'tasks' | 'history'>('tasks');
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCases = async () => {
    try {
      const response = await api.get('/case');
      setCases(response.data);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchCases(); }, [activeTab]);

  const startCollection = async (id: string) => { await api.patch(`/case/${id}`, { status: 'inProgress' }); fetchCases(); };
  const markCollected = async (id: string) => { await api.patch(`/case/${id}`, { status: 'closed' }); fetchCases(); };

  const myTasks = cases.filter(c => ['pending', 'open', 'inProgress'].includes(c.status));
  const myHistory = cases.filter(c => ['closed', 'rejected'].includes(c.status));

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col pb-24 font-sans">
      
      <header className="bg-[#1B2CC1] text-white shadow-md p-5 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Spotless Driver</h1>
          <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mt-1">{myTasks.length} Active Tasks</p>
        </div>
        <button onClick={logout} className="text-blue-200 hover:text-white bg-white/10 p-2 rounded-full transition-colors">
          <LogOut size={20} />
        </button>
      </header>

      <main className="flex-1 p-4 max-w-md w-full mx-auto overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-[#1B2CC1]" size={40}/></div>
        ) : activeTab === 'tasks' ? (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 pt-2">
            {myTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center mt-20 bg-white p-8 rounded-3xl shadow-sm">
                <CheckCircle className="w-20 h-20 text-[#2A835F] mb-4" />
                <h2 className="text-xl font-bold text-gray-800">All Clear!</h2>
                <p className="text-gray-500 font-medium text-center mt-2">No active collections assigned.</p>
              </div>
            ) : (
              myTasks.map((report) => <TaskCard key={report.id} report={report} startCollection={startCollection} markCollected={markCollected} />)
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 pt-2">
            <h2 className="text-xl font-extrabold text-gray-800">My Completed Runs</h2>
            {myHistory.map((report) => (
              <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 flex gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-xl shrink-0 overflow-hidden">
                   {report.imagePath && <img src={`${BACKEND_URL}/${report.imagePath}`} className="w-full h-full object-cover" />}
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="font-bold text-gray-800 text-sm uppercase">{report.priority || 'Waste Task'} PRIORITY</h3>
                  <p className="text-xs text-gray-400 font-medium mb-2">{new Date(report.updatedAt).toLocaleDateString()}</p>
                  <span className="text-[10px] bg-[#eaf3ef] text-[#2A835F] px-2 py-1 rounded-md font-bold uppercase tracking-wide w-fit border border-[#cbe5d8]">Collected</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Nav */}
      <nav className="fixed bottom-6 left-0 w-full z-50 px-6">
        <div className="bg-white border border-gray-200 text-gray-500 rounded-full flex justify-between max-w-sm mx-auto p-2 shadow-2xl">
          <button onClick={() => setActiveTab('tasks')} className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-bold transition-all ${activeTab === 'tasks' ? 'bg-[#1B2CC1] text-white shadow-md' : 'hover:bg-gray-50'}`}>
            <MapPin size={18} /> Routing
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-[#1B2CC1] text-white shadow-md' : 'hover:bg-gray-50'}`}>
            <CheckCircle size={18} /> History
          </button>
        </div>
      </nav>
    </div>
  );
}

function TaskCard({ report, startCollection, markCollected }: any) {
  const [proofImage, setProofImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openGoogleMaps = () => window.open(`https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`, '_blank');

  const handleProofCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProofImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="relative h-40 bg-gray-100">
        {report.imagePath && <img src={`${BACKEND_URL}/${report.imagePath}`} alt="Waste" className="w-full h-full object-cover" />}
        <div className="absolute top-3 left-3 bg-[#1B2CC1] text-white px-3 py-1 rounded-full text-xs font-black shadow-md uppercase tracking-widest">
          {report.status}
        </div>
      </div>
      
      <div className="p-5">
        <div className="mb-5 flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-gray-900 text-lg uppercase tracking-wide">{report.priority ? `${report.priority} PRIORITY` : 'New Task'}</h3>
            <p className="text-sm text-gray-500 font-medium mt-1">{report.description || 'No description provided.'}</p>
          </div>
        </div>

        <button onClick={openGoogleMaps} className="w-full mb-4 text-[#1B2CC1] font-bold flex items-center justify-center gap-2 bg-[#e8eafe] py-3 rounded-xl hover:bg-[#d1d5fc] transition-colors">
          <Navigation size={18} /> Get GPS Directions
        </button>

        {(report.status === 'pending' || report.status === 'open') && (
          <button onClick={() => startCollection(report.id)} className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xl hover:bg-black transition-all">
            <Play size={20} /> Begin Collection
          </button>
        )}

        {report.status === 'inProgress' && (
          <div className="space-y-4 bg-[#f8fafc] p-4 rounded-2xl border border-gray-200">
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleProofCapture} />
            
            {proofImage ? (
              <div className="relative">
                <img src={proofImage} className="w-full h-32 object-cover rounded-xl border border-gray-300 shadow-sm" />
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 bg-white text-gray-800 font-bold text-xs px-3 py-1.5 rounded-full shadow-lg">Retake</button>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-white border-2 border-dashed border-[#2A835F] text-[#2A835F] font-bold rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-[#eaf3ef] transition-colors">
                <Camera size={24} /> Snap Proof
              </button>
            )}

            <button onClick={() => markCollected(report.id)} disabled={!proofImage} 
              className={`w-full py-4 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all ${proofImage ? 'bg-[#2A835F] shadow-xl shadow-[#2A835F]/30 hover:-translate-y-1' : 'bg-gray-300'}`}>
              <CheckCircle size={20} /> Mark as Resolved
            </button>
          </div>
        )}
      </div>
    </div>
  );
}