import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { SITE_CONFIG, NAV_LINKS, getWhatsAppUrl } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Shri Siddhi Vinayak Trading Co."
                width={48}
                height={48}
                className="h-12 w-12 rounded-full bg-white object-cover p-1"
              />
              <div>
                <h3 className="font-[var(--font-heading)] text-base font-bold">
                  Shri Siddhi Vinayak
                </h3>
                <p className="text-xs font-semibold text-orange">Trading Co.</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-white/70">
              {SITE_CONFIG.tagline}
            </p>
            <p className="text-xs text-white/50">GST: {SITE_CONFIG.gst}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-[var(--font-heading)] text-sm font-bold uppercase tracking-wider text-orange">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product Categories */}
          <div>
            <h4 className="mb-4 font-[var(--font-heading)] text-sm font-bold uppercase tracking-wider text-orange">
              Products
            </h4>
            <ul className="space-y-2">
              {[
                'Industrial Tools',
                'Electric Power Tools',
                'Welding Accessories',
                'Project Materials',
                'Safety Equipment',
              ].map((cat) => (
                <li key={cat}>
                  <span className="text-sm text-white/70">{cat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-4 font-[var(--font-heading)] text-sm font-bold uppercase tracking-wider text-orange">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange" />
                <span className="text-sm text-white/70">
                  {SITE_CONFIG.contact.address}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-orange" />
                <div className="flex flex-col">
                  <a
                    href={SITE_CONFIG.contact.phone1Link}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {SITE_CONFIG.contact.phone1}
                  </a>
                  <a
                    href={SITE_CONFIG.contact.phone2Link}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {SITE_CONFIG.contact.phone2}
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 shrink-0 text-orange" />
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/70 transition-colors hover:text-white"
                >
                  WhatsApp Us
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-orange" />
                <a
                  href={SITE_CONFIG.contact.emailLink}
                  className="text-sm text-white/70 transition-colors hover:text-white break-all"
                >
                  {SITE_CONFIG.contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-white/10 pt-8 text-center space-y-3">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6 text-xs text-white/50">
            <p>
              Powered By{' '}
              <a
                href="https://www.instagram.com/stacklyy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-orange transition-colors font-medium"
              >
                @stacklyy
              </a>
            </p>
            <p className="hidden sm:inline text-white/10">|</p>
            <p>
              Created by{' '}
              <a
                href="https://www.linkedin.com/in/kavya-patel-569296376/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-orange transition-colors font-medium"
              >
                @kavyaPatel
              </a>
              {' '}
              <a
                href="https://www.linkedin.com/in/darshan-jaladkar-5725a138a/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-orange transition-colors font-medium"
              >
                @DarshanJaladkar
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
