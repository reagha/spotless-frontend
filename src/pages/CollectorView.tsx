import { useReportStore } from '../store/useReportStore';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, Navigation, CheckCircle, MapPin } from 'lucide-react';

export default function CollectorView() {
  const reports = useReportStore((state) => state.reports);
  const markCollected = useReportStore((state) => state.markCollected);
  const logout = useAuthStore((state) => state.logout);

  // We only want the driver to see waste that hasn't been collected yet
  const pendingReports = reports.filter(r => r.status === 'PENDING');

  // Hackathon Trick: This opens the native Google Maps app on a phone with directions!
  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-orange-600">Truck 02 Route</h1>
          <p className="text-xs text-gray-500">{pendingReports.length} stops remaining</p>
        </div>
        <button onClick={logout} className="text-gray-500 hover:text-red-500">
          <LogOut size={20} />
        </button>
      </header>

      {/* Main List */}
      <main className="flex-1 p-4 max-w-md w-full mx-auto space-y-4">
        {pendingReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-800">All caught up!</h2>
            <p className="text-gray-500">No pending waste collections in your area.</p>
          </div>
        ) : (
          pendingReports.map((report, index) => (
            <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <img src={report.image} alt="Waste to collect" className="w-full h-32 object-cover" />
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        Priority {index + 1}
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <MapPin size={12} /> {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => openGoogleMaps(report.lat, report.lng)}
                    className="flex-1 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg flex items-center justify-center gap-2 border border-blue-200"
                  >
                    <Navigation size={18} /> Navigate
                  </button>
                  <button 
                    onClick={() => markCollected(report.id)}
                    className="flex-1 py-2 bg-green-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 shadow"
                  >
                    <CheckCircle size={18} /> Done
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}