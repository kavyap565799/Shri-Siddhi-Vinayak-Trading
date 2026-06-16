import { Metadata } from 'next';
import { MapPin, Phone, MessageCircle, Clock } from 'lucide-react';
import { SITE_CONFIG, getWhatsAppUrl } from '@/lib/constants';
import { EnquirySection } from '@/components/landing/EnquirySection';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Shri Siddhi Vinayak Trading Co. — Visit us in Motikhavdi, Jamnagar, Gujarat or reach out via phone or WhatsApp.',
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
            <p className="mt-2 text-sm text-text-muted">Mon - Sat: 8 AM - 8 PM</p>
            <p className="text-sm text-text-muted">Sunday: 8 AM - 2 PM</p>
          </div>
        </div>

        {/* Map Section */}
        <div className="mb-16 rounded-2xl border border-border-light bg-white p-6 shadow-sm">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Map Info Column */}
            <div className="lg:col-span-1 flex flex-col justify-between">
              <div>
                <h2 className="font-[var(--font-heading)] text-2xl font-bold text-text-dark">
                  Find Our Shop
                </h2>
                <p className="mt-2 text-sm text-text-muted">
                  We are conveniently located on the Jamnagar-Khambhaliya Highway in Motikhavdi, right near Meera Hotel. Come visit us for all your industrial, welding, power tools, and safety equipment needs.
                </p>
                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 rounded bg-orange/10 p-1.5 text-orange shrink-0">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-text-dark uppercase tracking-wider">Address</p>
                      <p className="text-sm text-text-muted mt-0.5">{SITE_CONFIG.contact.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 rounded bg-navy/5 p-1.5 text-navy shrink-0">
                      <Clock className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-text-dark uppercase tracking-wider">Store Hours</p>
                      <p className="text-sm text-text-muted mt-0.5">Mon - Sat: 8:00 AM - 8:00 PM</p>
                      <p className="text-sm text-text-muted font-semibold text-orange mt-0.5">Sunday: 8:00 AM - 2:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 lg:mt-0">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Shri+Siddhi+Vinayak+Trading+Co.+Motikhavdi+Jamnagar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-navy/90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2"
                >
                  <MapPin className="h-4 w-4" />
                  Get Directions on Google Maps
                </a>
              </div>
            </div>
            {/* Embed Map Column */}
            <div className="lg:col-span-2">
              <div className="relative h-[300px] w-full overflow-hidden rounded-xl border border-border-light bg-bg sm:h-[400px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4375.556103099812!2d69.87023687586867!3d22.401779639208332!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395717c003ecd603%3A0x2e0294216b7e1f71!2sShri%20Siddhi%20Vinayak%20Trading%20Co.!5e1!3m2!1sen!2sin!4v1781291868397!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry Section */}
      <EnquirySection />
    </div>
  );
}
