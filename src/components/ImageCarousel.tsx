import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  layout?: 'grid' | 'slideshow';
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, layout = 'grid' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      {/* Screen View: Carousel */}
      <div className="print:hidden relative group w-full max-w-sm mx-auto aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
        <img 
          src={images[currentIndex]} 
          alt={`Slide ${currentIndex + 1}`} 
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        
        {images.length > 1 && (
          <>
            <button 
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow-sm hover:bg-white text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow-sm hover:bg-white text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={20} />
            </button>
            
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/80'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Print View: Grid or Slideshow */}
      <div className="hidden print:block">
        {layout === 'slideshow' ? (
          <div className="space-y-8">
            {images.map((img, idx) => (
              <div key={idx} className="w-full h-[90vh] flex items-center justify-center break-after-page">
                <img src={img} alt={`Photo ${idx + 1}`} className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="aspect-[3/4] overflow-hidden rounded-lg border border-gray-200 break-inside-avoid">
                <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
