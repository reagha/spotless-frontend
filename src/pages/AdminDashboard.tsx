import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { useAuthStore, api } from '../store/useAuthStore';
import { LogOut, Search, Activity, Leaf, BarChart3, List as ListIcon, MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BACKEND_URL } from '../store/useAuthStore';

const getPinColor = (status: string, priority: string | null) => {
  if (status === 'closed') return '#2A835F'; 
  if (status === 'rejected') return '#ef4444'; 
  switch (priority) {
    case 'high': return '#ef4444'; 
    case 'medium': return '#f97316'; 
    case 'low': return '#eab308'; 
    default: return '#1B2CC1';
  }
};

const createCustomIcon = (status: string, priority: string | null) => L.divIcon({
  className: 'custom-icon',
  html: `<div style="background-color: ${getPinColor(status, priority)}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

export default function AdminDashboard() {
  const logout = useAuthStore((state) => state.logout);
  const { snapshot, isConnected, connect, disconnect } = useAnalyticsStore();
  
  const [sidebarTab, setSidebarTab] = useState<'cases' | 'analytics'>('cases');
  const [searchTerm, setSearchTerm] = useState('');
  const [richCases, setRichCases] = useState<any[]>([]);

  const kampalaCoords: [number, number] = [0.347596, 32.582520];

  useEffect(() => { connect(); fetchRichCases(); return () => disconnect(); }, []);
  useEffect(() => { if (snapshot) fetchRichCases(); }, [snapshot?.generatedAt]);

  const fetchRichCases = () => api.get('/case').then(res => setRichCases(res.data)).catch(console.error);
  const filteredCases = richCases.filter(c => (c.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] overflow-hidden font-sans">
      
      <header className="bg-[#111827] text-white p-4 flex justify-between items-center z-[1000] relative shrink-0 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-[#2A835F] p-1.5 rounded"><Leaf className="text-white w-5 h-5" /></div>
          <h1 className="text-xl font-bold tracking-wide">SPOTLESS <span className="text-gray-400 font-light text-sm ml-2">| Authority Command</span></h1>
          <span className={`ml-4 flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${isConnected ? 'bg-[#2A835F] text-white' : 'bg-red-500 text-white'}`}>
            <Activity size={12} className={isConnected ? "animate-pulse" : ""} /> {isConnected ? 'Live Stream' : 'Offline'}
          </span>
        </div>
        <button onClick={logout} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-semibold transition-colors">
          <LogOut size={16} /> Logout
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* WIDER SIDEBAR to fit more info */}
        <div className="w-[450px] flex flex-col bg-white border-r border-gray-200 z-[10] shadow-xl">
          
          {/* Key Metrics Header */}
          <div className="p-4 grid grid-cols-3 gap-2 bg-gray-50 border-b border-gray-200">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
              <div className="text-2xl font-black text-[#1B2CC1]">{snapshot?.cases.byStatus.pending || 0}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Pending</div>
            </div>
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
              <div className="text-2xl font-black text-orange-500">{snapshot?.cases.byStatus.inProgress || 0}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">In Transit</div>
            </div>
            <div className="bg-[#2A835F] p-3 rounded-xl shadow-sm flex flex-col items-center justify-center">
              <div className="text-2xl font-black text-white">{snapshot?.cases.byStatus.closed || 0}</div>
              <div className="text-[10px] text-green-200 uppercase tracking-widest font-bold mt-1">Resolved</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-white">
            <button onClick={() => setSidebarTab('cases')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${sidebarTab === 'cases' ? 'border-b-2 border-[#1B2CC1] text-[#1B2CC1]' : 'text-gray-400 hover:bg-gray-50'}`}>
              <ListIcon size={16} /> Live Feed
            </button>
            <button onClick={() => setSidebarTab('analytics')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${sidebarTab === 'analytics' ? 'border-b-2 border-[#1B2CC1] text-[#1B2CC1]' : 'text-gray-400 hover:bg-gray-50'}`}>
              <BarChart3 size={16} /> ML Analytics
            </button>
          </div>

          {/* TAB 1: CASES FEED */}
          {sidebarTab === 'cases' && (
            <div className="flex-col flex flex-1 overflow-hidden">
              <div className="p-3 border-b border-gray-100 shrink-0 bg-white">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input type="text" placeholder="Filter descriptions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-[#1B2CC1] focus:bg-white outline-none transition-all" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-[#f8fafc]">
                {filteredCases.map((report: any) => (
                  <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:border-[#1B2CC1] transition-colors group">
                    <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-2">
                      <span className="font-extrabold text-[10px] uppercase tracking-wider bg-gray-100 px-2 py-1 rounded text-gray-600">ID: {report.id.substring(0,8)}</span>
                      <span className="text-[10px] text-gray-400 font-bold">{new Date(report.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0 overflow-hidden border border-gray-200 group-hover:shadow-md transition-all">
                        {report.imagePath && <img src={`${BACKEND_URL}/${report.imagePath}`} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <span className="font-extrabold text-xs uppercase tracking-wide">
                            {report.priority ? <span className={report.priority === 'high' ? 'text-red-600' : 'text-[#1B2CC1]'}>{report.priority} PRIORITY</span> : 'AI Processing'}
                          </span>
                          <p className="text-xs text-gray-500 line-clamp-1 mt-1 font-medium">{report.description || 'No notes provided.'}</p>
                          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 font-mono"><MapPin size={10}/> {parseFloat(report.latitude).toFixed(4)}, {parseFloat(report.longitude).toFixed(4)}</p>
                        </div>
                        <div className="mt-2">
                          <span className={`text-[9px] px-2 py-1 rounded font-bold uppercase tracking-widest ${
                            report.status === 'closed' ? 'bg-[#eaf3ef] text-[#2A835F]' : 
                            report.status === 'pending' ? 'bg-gray-100 text-gray-600' : 'bg-[#e8eafe] text-[#1B2CC1]'
                          }`}>{report.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ML ANALYTICS */}
          {sidebarTab === 'analytics' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-white">
              
              <div className="bg-[#1B2CC1] rounded-2xl p-5 text-white shadow-lg">
                <h3 className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-1">Total ML Detections</h3>
                <p className="text-4xl font-black">{snapshot?.waste.totalDetections || 0} <span className="text-sm font-medium text-blue-200">items found</span></p>
              </div>

              <div>
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">Detected Types</h3>
                {snapshot?.waste.byType && snapshot.waste.byType.length > 0 ? (
                  snapshot.waste.byType.map((type: any, index: number) => (
                    <div key={index} className="mb-3">
                      <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                        <span>{type.name}</span>
                        <span>{type.quantity} items</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-[#2A835F] h-2 rounded-full" style={{ width: `${Math.min(100, (type.quantity / (snapshot?.waste.totalQuantity || 1)) * 100)}%` }}></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">Waiting for ML classifications...</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">Hazard Breakdown</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-center">
                    <p className="text-2xl font-black text-red-600">{snapshot?.waste.byHazardLevel?.high || 0}</p>
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">High Risk</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 text-center">
                    <p className="text-2xl font-black text-orange-500">{snapshot?.waste.byHazardLevel?.medium || 0}</p>
                    <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Med Risk</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 text-center">
                    <p className="text-2xl font-black text-yellow-600">{snapshot?.waste.byHazardLevel?.low || 0}</p>
                    <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">Low Risk</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center">
                    <p className="text-2xl font-black text-gray-600">{snapshot?.waste.byHazardLevel?.unclassified || 0}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Unclassified</p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* RIGHT PANEL: LIVE MAP */}
        <div className="flex-1 relative z-0 bg-gray-200">
          <MapContainer center={kampalaCoords} zoom={13} className="h-full w-full">
            <TileLayer 
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' 
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
/>
            {snapshot?.live.activeCases.map((liveCase) => (
              <Marker key={liveCase.id} position={[liveCase.latitude, liveCase.longitude]} icon={createCustomIcon(liveCase.status, liveCase.priority)}>
                <Popup className="spotless-popup">
                  <div className="w-48 text-center py-1">
                    <span className="font-bold text-gray-800 uppercase block border-b pb-1 mb-1">{liveCase.priority || 'Analyzing'} PRIORITY</span>
                    <span className="text-xs text-gray-500 uppercase tracking-widest">Status: {liveCase.status}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}