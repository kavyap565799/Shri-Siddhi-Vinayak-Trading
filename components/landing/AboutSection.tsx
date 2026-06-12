'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Award, Package, Building, FileCheck } from 'lucide-react';

const STATS = [
  { icon: Award, label: 'Years of Service', value: 25, suffix: '+' },
  { icon: Package, label: 'Products Available', value: 1000, suffix: '+' },
  { icon: Building, label: 'Trusted Brands', value: 100, suffix: '+' },
  { icon: FileCheck, label: 'GST Registered', value: 0, suffix: '', display: 'GST' },
];

function AnimatedCounter({ target, suffix, display }: { target: number; suffix: string; display?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView || display) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, display]);

  return (
    <span ref={ref} className="font-[var(--font-heading)] text-4xl font-extrabold text-navy sm:text-5xl">
      {display || count}{suffix}
    </span>
  );
}

export function AboutSection() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-[var(--font-heading)] text-3xl font-extrabold text-text-dark sm:text-4xl">
              About{' '}
              <span className="text-orange">Our Shop</span>
            </h2>
            <div className="mt-6 space-y-4 text-text-muted leading-relaxed">
              <p>
                <span className="font-semibold text-text-dark">Shri Siddhi Vinayak Trading Co.</span>{' '}
                has been a trusted name in industrial tools and equipment for over 25 years in Godhra, Gujarat.
              </p>
              <p>
                We are your one-stop destination for high-quality industrial hand tools, electric power tools,
                welding accessories, project materials, and safety equipment. Our vast inventory of 1000+
                products from 100+ renowned brands ensures that every professional and DIY enthusiast finds
                exactly what they need.
              </p>
              <p>
                As a GST-registered firm (24AJSPC0245L1Z8), we pride ourselves on offering genuine products,
                competitive pricing, and exceptional customer service. Whether you&apos;re equipping a workshop,
                a construction site, or a factory — we&apos;ve got you covered.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="h-12 w-1 rounded-full bg-orange" />
              <div>
                <p className="font-[var(--font-heading)] font-bold text-text-dark">
                  Harish Chaudhary
                </p>
                <p className="text-sm text-text-muted">Proprietor</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-6"
          >
            {STATS.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="rounded-xl border border-border-light bg-bg p-6 text-center shadow-sm"
              >
                <stat.icon className="mx-auto mb-3 h-8 w-8 text-orange" />
                <AnimatedCounter target={stat.value} suffix={stat.suffix} display={stat.display} />
                <p className="mt-1 text-sm text-text-muted">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
