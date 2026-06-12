'use client';

import { MessageCircle, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { getWhatsAppUrl } from '@/lib/constants';

export function FloatingButtons() {
  const scrollToEnquiry = () => {
    const el = document.getElementById('enquiry');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3"
    >
      {/* Enquiry Button */}
      <button
        onClick={scrollToEnquiry}
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-orange shadow-lg shadow-orange/30 text-white transition-all hover:scale-110 hover:bg-orange-dark hover:shadow-xl"
        aria-label="Send Enquiry"
      >
        <Phone className="h-6 w-6 transition-transform group-hover:scale-110" />
      </button>

      {/* WhatsApp Button */}
      <a
        href={getWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp shadow-lg shadow-whatsapp/30 text-white transition-all hover:scale-110 hover:bg-whatsapp-dark hover:shadow-xl"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
      </a>
    </motion.div>
  );
}
