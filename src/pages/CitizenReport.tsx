import { useState, useRef } from 'react';
import { useReportStore } from '../store/useReportStore';
import { useAuthStore } from '../store/useAuthStore';
import { Camera, MapPin, Loader2, CheckCircle, LogOut, Clock, Truck, List } from 'lucide-react';

export default function CitizenReport() {
  // Tabs: 'new' for reporting, 'tracking' for dashboard
  const [activeTab, setActiveTab] = useState<'new' | 'tracking'>('new');
  
  // Form State
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { reports, addReport } = useReportStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter reports to only show the ones this specific user created
  const myReports = reports.filter(r => r.userId === user?.id);

  // 1. Capture Image
  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 2. Capture Location
  const getLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsLocating(false);
        },
        () => {
          alert('Could not get your location. Please enable GPS.');
          setIsLocating(false);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  // 3. Submit Report
  const handleSubmit = () => {
    if (!image || !location || !user) return;
    setIsSubmitting(true);
    
    setTimeout(() => {
      addReport({
        userId: user.id,
        image,
        lat: location.lat,
        lng: location.lng,
        description: description || undefined,
        category: category || undefined,
      });
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1000);
  };

  // 4. Reset Form
  const resetForm = () => {
    setImage(null);
    setLocation(null);
    setDescription('');
    setCategory('');
    setIsSuccess(false);
    setActiveTab('tracking'); // Take them to tracking to see their new report!
  };

  // --- RENDER SUCCESS SCREEN ---
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-green-50 p-6 text-center">
        <CheckCircle className="w-24 h-24 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Received!</h2>
        <p className="text-gray-600 mb-8">Thank you! Your report has been submitted to the authorities.</p>
        <button onClick={resetForm} className="w-full max-w-md bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg">
          Track My Report
        </button>
      </div>
    );
  }

  // --- RENDER MAIN UI ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-green-600">WasteWise</h1>
          <p className="text-xs text-gray-500">Welcome back, Citizen</p>
        </div>
        <button onClick={logout} className="text-gray-500 hover:text-red-500">
          <LogOut size={20} />
        </button>
      </header>

      {/* Main Content Area based on Tabs */}
      <main className="flex-1 p-4 max-w-md w-full mx-auto space-y-4">
        
        {/* NEW REPORT TAB */}
        {activeTab === 'new' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            {/* MANDATORY: Photo */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm">
                <span className="text-red-500">*</span> 1. Take a Photo
              </h2>
              <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleImageCapture} />
              {image ? (
                <div className="relative rounded-lg overflow-hidden h-40 bg-gray-100">
                  <img src={image} alt="Waste" className="w-full h-full object-cover" />
                  <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 bg-white/90 text-sm px-3 py-1 rounded-md shadow">Retake</button>
                </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()} className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 bg-gray-50 hover:bg-gray-100">
                  <Camera size={24} className="mb-1 text-gray-400" />
                  <span className="text-sm">Tap to open camera</span>
                </button>
              )}
            </div>

            {/* MANDATORY: Location */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm">
                <span className="text-red-500">*</span> 2. Tag Location
              </h2>
              {location ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-lg">
                  <MapPin size={20} /> <span className="text-sm font-medium">Location Acquired</span>
                </div>
              ) : (
                <button onClick={getLocation} disabled={isLocating} className="w-full py-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50">
                  {isLocating ? <Loader2 className="animate-spin" size={18} /> : <MapPin size={18} />}
                  <span className="text-sm">{isLocating ? 'Finding you...' : 'Get Current Location'}</span>
                </button>
              )}
            </div>

            {/* OPTIONAL: Extra Info */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-700 mb-3 text-sm text-gray-400">3. Extra Details (Optional)</h2>
              
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 mb-3 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value="">Select Waste Type...</option>
                <option value="Plastic">Plastic</option>
                <option value="Organic">Organic / Food</option>
                <option value="Electronic">Electronic (E-Waste)</option>
                <option value="Mixed">Mixed Rubbish</option>
              </select>

              <textarea 
                placeholder="Any other details? (e.g., blocking the road)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-gray-50 h-20 focus:ring-2 focus:ring-green-500 outline-none resize-none"
              />
            </div>

            {/* Submit */}
            <button 
              onClick={handleSubmit} 
              disabled={!image || !location || isSubmitting}
              className={`w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition mt-4 ${
                image && location && !isSubmitting ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500'
              }`}
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Submit Report'}
            </button>
          </div>
        )}

        {/* TRACKING TAB */}
        {activeTab === 'tracking' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-bold text-gray-800">My Reports</h2>
            
            {myReports.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
                <List className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">You haven't reported any waste yet.</p>
              </div>
            ) : (
              myReports.map((report) => (
                <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex gap-3 p-3">
                  <img src={report.image} alt="Waste" className="w-24 h-24 object-cover rounded-lg" />
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-gray-500 uppercase">{report.category || 'Mixed Waste'}</span>
                      <span className="text-[10px] text-gray-400">{new Date(report.timestamp).toLocaleDateString()}</span>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="mt-2">
                      {report.status === 'PENDING' && <span className="inline-flex items-center gap-1 text-xs font-bold bg-orange-50 text-orange-600 px-2 py-1 rounded-full"><Clock size={12}/> Pending</span>}
                      {report.status === 'COLLECTED' && <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-50 text-green-600 px-2 py-1 rounded-full"><CheckCircle size={12}/> Collected</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 pb-safe">
        <div className="flex justify-around max-w-md mx-auto">
          <button 
            onClick={() => setActiveTab('new')} 
            className={`flex-1 py-4 flex flex-col items-center gap-1 text-xs font-medium ${activeTab === 'new' ? 'text-green-600' : 'text-gray-400'}`}
          >
            <Camera size={20} /> Report Waste
          </button>
          <button 
            onClick={() => setActiveTab('tracking')} 
            className={`flex-1 py-4 flex flex-col items-center gap-1 text-xs font-medium ${activeTab === 'tracking' ? 'text-green-600' : 'text-gray-400'}`}
          >
            <List size={20} /> My Reports
          </button>
        </div>
      </nav>
    </div>
  );
}