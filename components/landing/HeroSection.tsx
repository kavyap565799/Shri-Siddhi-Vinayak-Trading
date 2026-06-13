'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MessageCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWhatsAppUrl } from '@/lib/constants';

const languages = [
  { prefix: 'You Can', highlight: 'Trust', lang: 'en' },
  { prefix: 'आप', highlight: 'भरोसा कर सकते हैं', lang: 'hi' },
  { prefix: 'તમે', highlight: 'ભરોસો કરી શકો છો', lang: 'gu' }
];

export function HeroSection() {
  const [langIndex, setLangIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLangIndex((prev) => (prev + 1) % languages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);
  return (
    <section className="hero-grid-bg relative min-h-[90vh] overflow-hidden bg-bg pt-20">
      {/* Decorative shapes */}
      <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-navy/5 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-orange/5 blur-3xl" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-8 lg:flex-row lg:gap-12 lg:px-8 lg:py-12">
        {/* Left — Text content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="flex-1 text-center lg:text-left"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-navy/10 bg-white px-4 py-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-whatsapp animate-pulse" />
            <span className="text-xs font-medium text-text-muted">
              15+ Years of Trusted Service
            </span>
          </div>

          <h1 className="font-[var(--font-heading)] text-3xl font-extrabold leading-tight tracking-tight text-text-dark sm:text-4xl lg:text-5xl">
            <span className="block">Industrial Tools & Equipment</span>
            <span className="block mt-2 inline-flex min-h-[1.2em] items-center" style={{ perspective: '1000px' }}>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={langIndex}
                  initial={{ opacity: 0, y: 15, rotateX: -80 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: -15, rotateX: 80 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="inline-flex items-center whitespace-nowrap"
                >
                  <span className="mr-2 text-text-dark">{languages[langIndex].prefix}</span>
                  <span className="text-orange relative inline-block">
                    {languages[langIndex].highlight}
                    <svg
                      className="absolute -bottom-1.5 left-0 w-full"
                      viewBox="0 0 200 12"
                      fill="none"
                    >
                      <path
                        d="M2 8C50 2 150 2 198 8"
                        stroke="#E8660A"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="opacity-40"
                      />
                    </svg>
                  </span>
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-text-muted lg:text-base">
            A House of{' '}
            <span className="font-semibold text-navy">1000+ Products</span> for
            every industrial need — power tools, welding accessories, safety
            equipment, and more.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button
              asChild
              size="default"
              className="bg-navy hover:bg-navy-light text-white font-semibold shadow-lg shadow-navy/20 h-11 px-6 text-sm"
            >
              <Link href="/products">
                Browse Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="default"
              variant="outline"
              className="border-whatsapp text-whatsapp hover:bg-whatsapp hover:text-white font-semibold h-11 px-6 text-sm"
            >
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp Enquiry
              </a>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 lg:justify-start">
            {[
              { label: '1000+', sub: 'Products' },
              { label: '100+', sub: 'Brands' },
              { label: 'GST', sub: 'Registered' },
            ].map((badge) => (
              <div key={badge.label} className="text-center">
                <p className="text-2xl font-bold text-navy">{badge.label}</p>
                <p className="text-xs text-text-muted">{badge.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — Shop sketch illustration */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="relative flex-1"
        >
          <div className="relative mx-auto w-full max-w-md">
            {/* Decorative frame */}
            <div className="absolute -inset-4 rounded-2xl border-2 border-dashed border-navy/10" />
            <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-orange" />
            <div className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-navy" />

            <div className="relative overflow-hidden rounded-xl bg-white p-2 shadow-2xl shadow-navy/10">
              <Image
                src="/shop-sketch.png"
                alt="Shri Siddhi Vinayak Trading Co. — Shop Illustration"
                width={500}
                height={333}
                className="w-full rounded-lg object-cover"
                priority
              />
            </div>

            {/* Floating label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-navy px-6 py-2 text-sm font-semibold text-white shadow-lg"
            >
              📍 Motikhavdi, Jamnagar
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="h-8 w-8 text-navy/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}
