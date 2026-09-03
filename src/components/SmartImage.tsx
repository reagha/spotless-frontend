import { useImageCache } from '../store/useImageCache';
import { BACKEND_URL } from '../store/useAuthStore';

export const SmartImage = ({ report, className }: { report: any, className?: string }) => {
  const cachedImage = useImageCache((state) => state.images[report.id]);
  
  // 1. If we have it in our local cache, use it immediately!
  if (cachedImage) {
    return <img src={cachedImage} alt="Waste" className={className} />;
  }

  // 2. Otherwise, try the server
  return (
    <img 
      src={`${BACKEND_URL}/${report.imagePath}`} 
      alt="Waste" 
      className={className}
      onError={(e) => {
        // 3. Final Fallback if everything fails
        const seed = report.id.charCodeAt(0) % 5;
        const backups = [
          "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400",
          "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=400",
          "https://images.unsplash.com/photo-1605600611284-195205ef91b6?w=400",
          "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400",
          "https://images.unsplash.com/photo-1591193512858-aa2d600df83b?w=400"
        ];
        e.currentTarget.src = backups[seed];
      }}
    />
  );
};