import { useState, useRef, useEffect } from 'react';
import { useAuthStore, api } from '../store/useAuthStore';
import { Camera, MapPin, Loader2, CheckCircle, LogOut, Clock, List,  Leaf, } from 'lucide-react';
import { BACKEND_URL } from '../store/useAuthStore';

export default function CitizenReport() {
  const [activeTab, setActiveTab] = useState<'new' | 'tracking'>('new');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [description, setDescription] = useState('');
  
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [myReports, setMyReports] = useState<any[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === 'tracking' && user) {
      setIsLoadingReports(true);
      api.get('/case').then(res => setMyReports(res.data.filter((c: any) => c.reporterId === user.id)))
        .catch(err => console.error(err)).finally(() => setIsLoadingReports(false));
    }
  }, [activeTab, user]);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setIsLocating(false); },
        () => { alert('Please enable GPS.'); setIsLocating(false); },
        { enableHighAccuracy: true }
      );
    }
  };

  const handleSubmit = async () => {
    if (!imageFile || !location || !user) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('latitude', location.lat.toString());
      formData.append('longitude', location.lng.toString());
      formData.append('reporterId', user.id);
      if (description) formData.append('description', description);
      await api.post('/case', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      setIsSuccess(true);
    } catch (error) { alert("Failed to submit."); } 
    finally { setIsSubmitting(false); }
  };

  const resetForm = () => {
    setImageFile(null); setImagePreview(null); setLocation(null); setDescription(''); setIsSuccess(false); setActiveTab('tracking');
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#2A835F] p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full flex flex-col items-center">
          <CheckCircle className="w-20 h-20 text-[#2A835F] mb-4" />
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Spotless!</h2>
          <p className="text-gray-500 mb-8 font-medium">Your report has been logged and the ML engine is analyzing it.</p>
          <button onClick={resetForm} className="w-full bg-[#1B2CC1] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#152399] transition">
            View My Tracking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f6f4] flex flex-col pb-24 font-sans">
      
      {/* Premium Extended Header */}
      <div className="bg-[#2A835F] pt-12 pb-28 px-6 rounded-b-[48px] shadow-lg relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
        
        <div className="flex justify-between items-center max-w-md mx-auto relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md shadow-inner"><Leaf className="text-white w-6 h-6" /></div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wide">Spotless</h1>
              <p className="text-[#a5d6c1] text-xs font-semibold uppercase tracking-wider mt-0.5">Hi, {user?.firstName}</p>
            </div>
          </div>
          <button onClick={logout} className="text-white hover:bg-white/20 bg-white/10 p-2.5 rounded-full backdrop-blur-md transition-all">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <main className="flex-1 px-4 max-w-md w-full mx-auto -mt-20 relative z-10 space-y-5">
        
        {activeTab === 'new' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8">
            
            {/* Step 1 */}
            <div className="bg-white rounded-3xl shadow-xl shadow-[#2A835F]/5 p-5 border border-white">
              <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <div className="bg-[#2A835F] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md">1</div> Take a Photo
              </h2>
              <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleImageCapture} />
              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden h-56 border-4 border-[#2A835F] shadow-md">
                  <img src={'${BACKEND_URL}/${report.imagePath}'} alt="Waste" className="w-full h-full object-cover" />
                  <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-3 right-3 bg-white text-[#2A835F] font-black text-xs px-5 py-2.5 rounded-full shadow-xl">RETAKE</button>
                </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()} className="w-full h-40 border-2 border-dashed border-[#a5d6c1] rounded-2xl flex flex-col items-center justify-center text-[#2A835F] bg-[#f4f9f7] hover:bg-[#eaf3ef] transition-colors">
                  <div className="bg-white p-3 rounded-full shadow-sm mb-3"><Camera size={28} /></div>
                  <span className="font-bold tracking-wide">Tap to open camera</span>
                </button>
              )}
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl shadow-xl shadow-[#2A835F]/5 p-5 border border-white">
              <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <div className="bg-[#2A835F] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md">2</div> Tag Location
              </h2>
              {location ? (
                <div className="flex items-center justify-between p-4 bg-[#e8eafe] text-[#1B2CC1] rounded-2xl border border-[#d1d5fc]">
                  <div className="flex items-center gap-3"><MapPin size={22} /><span className="font-bold">GPS Locked</span></div>
                  <CheckCircle size={22} className="text-[#1B2CC1]" />
                </div>
              ) : (
                <button onClick={getLocation} disabled={isLocating} className="w-full py-4 bg-[#f0f6f4] border border-[#d3e5dc] rounded-2xl flex items-center justify-center gap-3 text-gray-700 hover:bg-[#e2ede8] font-bold transition-colors shadow-inner">
                  {isLocating ? <Loader2 className="animate-spin text-[#1B2CC1]" size={22} /> : <MapPin className="text-[#2A835F]" size={22} />}
                  {isLocating ? 'Acquiring GPS...' : 'Get Current Location'}
                </button>
              )}
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl shadow-xl shadow-[#2A835F]/5 p-5 border border-white">
              <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <div className="bg-gray-200 text-gray-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-inner">3</div> Details <span className="text-gray-400 text-xs font-medium ml-1">(Optional)</span>
              </h2>
              <textarea placeholder="e.g., Blocking the drainage..." value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-2xl text-sm bg-gray-50 focus:ring-2 focus:ring-[#1B2CC1] outline-none resize-none" />
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={!imageFile || !location || isSubmitting}
              className={`w-full py-5 rounded-2xl font-black text-lg shadow-2xl flex items-center justify-center gap-2 transition-all mt-6 ${
                imageFile && location && !isSubmitting ? 'bg-[#2A835F] text-white hover:bg-[#226a4c] hover:-translate-y-1' : 'bg-gray-300 text-gray-500'
              }`}>
              {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Submit Report'}
            </button>
          </div>
        )}

        {/* Tracking Tab unchanged for brevity, but matches the new aesthetic */}
        {activeTab === 'tracking' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 pt-2">
            <h2 className="text-xl font-extrabold text-gray-800 px-2">My Reports</h2>
            {isLoadingReports ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#1B2CC1]" size={32} /></div>
            ) : myReports.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl shadow-lg border border-gray-100">
                <List className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-medium">No reports submitted yet.</p>
              </div>
            ) : (
              myReports.map((report) => (
                <div key={report.id} className="bg-white rounded-3xl shadow-lg border border-white p-3 flex gap-4 items-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                    {report.imagePath && <img src={`${BACKEND_URL}/${report.imagePath}`} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-black text-[#1B2CC1] uppercase tracking-widest">{report.priority ? `${report.priority} PRIORITY` : 'Analyzing'}</span>
                    <p className="text-xs text-gray-500 mt-1 mb-2 font-medium">{new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    <div>
                      {report.status === 'pending' && <span className="inline-flex gap-1 text-[10px] font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md uppercase tracking-wide"><Clock size={12}/> Pending</span>}
                      {report.status === 'open' && <span className="inline-flex gap-1 text-[10px] font-bold bg-[#e8eafe] text-[#1B2CC1] px-2.5 py-1 rounded-md uppercase tracking-wide"><Clock size={12}/> Verified</span>}
                      {report.status === 'inProgress' && <span className="inline-flex gap-1 text-[10px] font-bold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-md uppercase tracking-wide"><Clock size={12}/> In Progress</span>}
                      {report.status === 'closed' && <span className="inline-flex gap-1 text-[10px] font-bold bg-[#eaf3ef] text-[#2A835F] px-2.5 py-1 rounded-md uppercase tracking-wide"><CheckCircle size={12}/> Collected</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Floating Bottom Nav */}
      <nav className="fixed bottom-6 left-0 w-full z-50 px-6">
        <div className="bg-gray-900 text-white rounded-full flex justify-between max-w-sm mx-auto p-2 shadow-2xl shadow-gray-900/20">
          <button onClick={() => setActiveTab('new')} className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-bold transition-all ${activeTab === 'new' ? 'bg-[#2A835F]' : 'hover:bg-gray-800'}`}>
            <Camera size={18} /> Report
          </button>
          <button onClick={() => setActiveTab('tracking')} className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-bold transition-all ${activeTab === 'tracking' ? 'bg-[#1B2CC1]' : 'hover:bg-gray-800'}`}>
            <List size={18} /> History
          </button>
        </div>
      </nav>
    </div>
  );
}