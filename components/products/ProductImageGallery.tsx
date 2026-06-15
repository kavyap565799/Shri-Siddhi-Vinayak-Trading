'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  allImages: string[];
  name: string;
}

export function ProductImageGallery({ allImages, name }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeImage = allImages[activeIndex];

  return (
    <div>
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-xl border border-border-light bg-white shadow-sm">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-4"
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
