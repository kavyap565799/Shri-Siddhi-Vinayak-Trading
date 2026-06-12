import { Metadata } from 'next';
import { MapPin, Phone, MessageCircle, Clock } from 'lucide-react';
import { SITE_CONFIG, getWhatsAppUrl } from '@/lib/constants';
import { EnquirySection } from '@/components/landing/EnquirySection';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Shri Siddhi Vinayak Trading Co. — Visit us in Godhra, Gujarat or reach out via phone or WhatsApp.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-bg pt-24 pb-0">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="font-[var(--font-heading)] text-3xl font-extrabold text-text-dark sm:text-4xl">
            Contact <span className="text-navy">Us</span>
          </h1>
          <p className="mt-2 text-text-muted">
            We&apos;d love to hear from you. Reach out for any enquiries or visit us directly.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border-light bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5">
              <MapPin className="h-6 w-6 text-navy" />
            </div>
            <h3 className="font-[var(--font-heading)] text-sm font-bold text-text-dark">
              Visit Us
            </h3>
            <p className="mt-2 text-sm text-text-muted">{SITE_CONFIG.contact.address}</p>
          </div>

          <div className="rounded-xl border border-border-light bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange/5">
              <Phone className="h-6 w-6 text-orange" />
            </div>
            <h3 className="font-[var(--font-heading)] text-sm font-bold text-text-dark">
              Call Us
            </h3>
            <a href={SITE_CONFIG.contact.phone1Link} className="mt-2 block text-sm text-text-muted hover:text-navy">
              {SITE_CONFIG.contact.phone1}
            </a>
            <a href={SITE_CONFIG.contact.phone2Link} className="block text-sm text-text-muted hover:text-navy">
              {SITE_CONFIG.contact.phone2}
            </a>
          </div>

          <div className="rounded-xl border border-border-light bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-whatsapp/10">
              <MessageCircle className="h-6 w-6 text-whatsapp" />
            </div>
            <h3 className="font-[var(--font-heading)] text-sm font-bold text-text-dark">
              WhatsApp
            </h3>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-sm text-text-muted hover:text-whatsapp"
            >
              Chat with us instantly
            </a>
          </div>

          <div className="rounded-xl border border-border-light bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-[var(--font-heading)] text-sm font-bold text-text-dark">
              Working Hours
            </h3>
            <p className="mt-2 text-sm text-text-muted">Mon - Sat: 9 AM - 8 PM</p>
            <p className="text-sm text-text-muted">Sunday: Closed</p>
          </div>
        </div>
      </div>

      {/* Enquiry Section */}
      <EnquirySection />
    </div>
  );
}
