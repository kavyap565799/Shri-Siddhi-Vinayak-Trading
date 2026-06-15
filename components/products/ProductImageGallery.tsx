'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  allImages: string[];
  name: string;
}

export function ProductImageGallery({ allImages, name }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);

  const activeImage = allImages[activeIndex];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  return (
    <div>
      {/* Main Image */}
      <div 
        className="relative aspect-square overflow-hidden rounded-xl border border-border-light bg-white shadow-sm cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {activeImage ? (
          <Image
            src={activeImage}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-4 transition-transform duration-300 ease-out"
            style={
              isZoomed
                ? {
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: 'scale(1.8)',
                  }
                : {
                    transformOrigin: 'center center',
                    transform: 'scale(1)',
                  }
            }
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-6xl opacity-20">🔧</span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {allImages.map((img, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-white transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'border-navy ring-2 ring-navy/20'
                    : 'border-border-light hover:border-navy/50 hover:scale-105'
                }`}
              >
                <Image
                  src={img}
                  alt={`${name} - ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-contain p-1"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
