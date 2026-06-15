'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductImageGalleryProps {
  allImages: string[];
  name: string;
}

export function ProductImageGallery({ allImages, name }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lensStyle, setLensStyle] = useState<React.CSSProperties>({ display: 'none' });
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [showSideZoom, setShowSideZoom] = useState(false);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const activeImage = allImages[activeIndex];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Lens is 40% of container size
    const lensWidth = rect.width * 0.4;
    const lensHeight = rect.height * 0.4;

    // Center lens on cursor
    let lensLeft = x - lensWidth / 2;
    let lensTop = y - lensHeight / 2;

    // Constrain lens to container bounds
    if (lensLeft < 0) lensLeft = 0;
    if (lensLeft > rect.width - lensWidth) lensLeft = rect.width - lensWidth;
    if (lensTop < 0) lensTop = 0;
    if (lensTop > rect.height - lensHeight) lensTop = rect.height - lensHeight;

    // Calculate percentages for zoomed view background origin
    const xPercent = (lensLeft / (rect.width - lensWidth)) * 100;
    const yPercent = (lensTop / (rect.height - lensHeight)) * 100;

    setLensStyle({
      display: 'block',
      left: `${lensLeft}px`,
      top: `${lensTop}px`,
      width: `${lensWidth}px`,
      height: `${lensHeight}px`,
    });

    setZoomStyle({
      transformOrigin: `${xPercent}% ${yPercent}%`,
      transform: 'scale(2.5)',
    });

    setShowSideZoom(true);
  };

  const handleMouseLeave = () => {
    setLensStyle({ display: 'none' });
    setShowSideZoom(false);
  };

  const openLightbox = () => {
    setLightboxIndex(activeIndex);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setActiveIndex(lightboxIndex);
    setIsLightboxOpen(false);
  };

  // Keyboard controls for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, allImages.length, lightboxIndex]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  return (
    <div>
      {/* Outer wrapper for main image and zoom side panel */}
      <div className="relative">
        {/* Main Image Container */}
        <div 
          className="relative aspect-square overflow-hidden rounded-xl border border-border-light bg-white shadow-sm cursor-zoom-in"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={openLightbox}
        >
          {activeImage ? (
            <Image
              src={activeImage}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain p-4 transition-transform duration-300 ease-out"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-6xl opacity-20">🔧</span>
            </div>
          )}

          {/* Zoom Lens */}
          {showSideZoom && activeImage && (
            <div 
              className="absolute border border-navy/30 bg-navy/5 pointer-events-none rounded-md shadow-[0_0_10px_rgba(15,23,42,0.1)] z-10"
              style={lensStyle}
            />
          )}
        </div>

        {/* Side Zoom Panel (Desktop only) */}
        {showSideZoom && activeImage && (
          <div className="absolute top-0 left-[calc(100%+24px)] w-full h-full border border-border-light bg-white rounded-xl overflow-hidden shadow-2xl z-40 hidden lg:block">
            <div 
              className="w-full h-full relative"
              style={zoomStyle}
            >
              <Image
                src={activeImage}
                alt={name}
                fill
                sizes="(max-width: 1200px) 100vw, 50vw"
                className="object-contain p-8"
                priority
              />
            </div>
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

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 text-white z-10">
              <div className="text-sm font-medium opacity-80">
                {lightboxIndex + 1} / {allImages.length}
              </div>
              <div className="text-base font-semibold truncate max-w-xs md:max-w-md">
                {name}
              </div>
              <button
                onClick={closeLightbox}
                className="rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors cursor-pointer"
                aria-label="Close gallery"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="relative flex-1 flex items-center justify-center px-4 md:px-12">
              {/* Previous Button */}
              {allImages.length > 1 && (
                <button
                  onClick={() => setLightboxIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                  className="absolute left-4 md:left-8 z-10 rounded-full bg-white/10 p-3 hover:bg-white/20 transition-colors text-white cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
              )}

              {/* Active Image */}
              <div className="relative w-full h-[70vh] max-w-4xl">
                <motion.div
                  key={lightboxIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={allImages[lightboxIndex]}
                    alt={`${name} - Large ${lightboxIndex + 1}`}
                    fill
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    className="object-contain"
                    priority
                  />
                </motion.div>
              </div>

              {/* Next Button */}
              {allImages.length > 1 && (
                <button
                  onClick={() => setLightboxIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 md:right-8 z-10 rounded-full bg-white/10 p-3 hover:bg-white/20 transition-colors text-white cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              )}
            </div>

            {/* Thumbnail Bar */}
            {allImages.length > 1 && (
              <div className="p-6 bg-black/40 border-t border-white/10 overflow-x-auto flex justify-center gap-3">
                {allImages.map((img, i) => {
                  const isActive = i === lightboxIndex;
                  return (
                    <button
                      key={i}
                      onClick={() => setLightboxIndex(i)}
                      className={`relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border bg-white transition-all cursor-pointer ${
                        isActive ? 'border-orange hover:border-orange scale-105 ring-2 ring-orange/50' : 'border-white/20 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${i + 1}`}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
