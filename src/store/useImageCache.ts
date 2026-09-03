import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ImageCache {
  images: Record<string, string>; // Map of caseId -> Base64Image
  saveImage: (id: string, base64: string) => void;
}

export const useImageCache = create<ImageCache>()(
  persist(
    (set) => ({
      images: {},
      saveImage: (id, base64) => set((state) => ({
        images: { ...state.images, [id]: base64 }
      })),
    }),
    { name: 'spotless-img-cache' }
  )
);