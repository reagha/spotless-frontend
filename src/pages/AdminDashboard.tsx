import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useReportStore } from '../store/useReportStore';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, AlertTriangle } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Hackathon Trick: Leaflet sometimes breaks image icons in Vite. 
// So, we create a custom HTML circle icon. It looks cleaner and we can change the color easily!
const createCustomIcon = (color: string) => L.divIcon({
  className: 'custom-icon',
  html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function AdminDashboard() {
  const reports = useReportStore((state) => state.reports);
  const logout = useAuthStore((state) => state.logout);

  // We center the map on Kampala, Uganda 🇺🇬
  const kampalaCoords: [number, number] = [0.347596, 32.582520]; 

  // Count how many pending issues we have
  const pendingCount = reports.filter(r => r.status === 'PENDING').length;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center z-[1000] relative">
        <div>
          <h1 className="text-xl font-bold text-purple-600 flex items-center gap-2">
            🗺️ Waste Intelligence Map
          </h1>
          <p className="text-sm text-gray-500">Live Kampala Overview</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 border border-red-200">
            <AlertTriangle size={16} />
            {pendingCount} Critical Hotspots
          </div>
          <button onClick={logout} className="text-gray-500 hover:text-red-500 bg-gray-100 p-2 rounded-full">
            <LogOut size={20} />
          </button>
        </div>
      </header>
      
      {/* Map Area */}
      <main className="flex-1 relative z-0">
        {/* MapContainer takes up the rest of the screen */}
        <MapContainer center={kampalaCoords} zoom={13} className="h-full w-full">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Loop through all our reports and place pins on the map */}
          {reports.map((report) => (
            <Marker 
              key={report.id} 
              position={[report.lat, report.lng]} 
              // Red for pending, Green for collected
              icon={createCustomIcon(report.status === 'PENDING' ? '#ef4444' : '#22c55e')}
            >
              <Popup>
                <div className="w-48">
                  <img src={report.image} alt="Reported Waste" className="w-full h-32 object-cover rounded-md mb-2" />
                  <p className="font-bold text-gray-800">
                    Status: <span className={report.status === 'PENDING' ? 'text-red-600' : 'text-green-600'}>{report.status}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Reported: {new Date(report.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </main>
    </div>
  );
}