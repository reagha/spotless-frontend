import { useState, useRef } from 'react';
import { useReportStore } from '../store/useReportStore';
import { Camera, MapPin, Loader2, CheckCircle, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function CitizenReport() {
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const addReport = useReportStore((state) => state.addReport);
  const logout = useAuthStore((state) => state.logout);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Handle Image Capture
  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 2. Handle GPS Location
  const getLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLocating(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get your location. Please enable GPS.');
          setIsLocating(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setIsLocating(false);
    }
  };

  // 3. Submit Report
  const handleSubmit = () => {
    if (!image || !location) return;
    
    setIsSubmitting(true);
    
    // Fake a slight network delay for a realistic demo
    setTimeout(() => {
      addReport({
        image,
        lat: location.lat,
        lng: location.lng,
      });
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  // 4. Reset Form to report another waste pile
  const resetForm = () => {
    setImage(null);
    setLocation(null);
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-green-50 p-6 text-center">
        <CheckCircle className="w-24 h-24 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Submitted!</h2>
        <p className="text-gray-600 mb-8">Thank you for helping keep Uganda clean. The authorities have been notified.</p>
        <button onClick={resetForm} className="w-full max-w-md bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg">
          Report Another Hotspot
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-green-600">Report Waste</h1>
        <button onClick={logout} className="text-gray-500 hover:text-red-500">
          <LogOut size={20} />
        </button>
      </header>

      {/* Main Form */}
      <main className="flex-1 p-4 max-w-md w-full mx-auto space-y-6">
        
        {/* Step 1: Photo */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span> 
            Take a Photo
          </h2>
          
          <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleImageCapture} />
          
          {image ? (
            <div className="relative rounded-lg overflow-hidden h-48 bg-gray-100">
              <img src={image} alt="Waste" className="w-full h-full object-cover" />
              <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-2 right-2 bg-white/90 text-sm px-3 py-1 rounded-md shadow">
                Retake
              </button>
            </div>
          ) : (
            <button onClick={() => fileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 bg-gray-50 hover:bg-gray-100 transition">
              <Camera size={32} className="mb-2 text-gray-400" />
              <span>Tap to open camera</span>
            </button>
          )}
        </div>

        {/* Step 2: Location */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span> 
            Tag Location
          </h2>
          
          {location ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-lg">
              <MapPin size={24} />
              <span className="text-sm font-medium">Location Acquired</span>
            </div>
          ) : (
            <button onClick={getLocation} disabled={isLocating} className="w-full py-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50">
              {isLocating ? <Loader2 className="animate-spin" size={20} /> : <MapPin size={20} />}
              {isLocating ? 'Finding you...' : 'Get Current Location'}
            </button>
          )}
        </div>

        {/* Submit Button */}
        <button 
          onClick={handleSubmit} 
          disabled={!image || !location || isSubmitting}
          className={`w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition ${
            image && location && !isSubmitting ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isSubmitting && <Loader2 className="animate-spin" size={20} />}
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>

      </main>
    </div>
  );
}