'use client';

import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, MessageCircle, MapPin, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SITE_CONFIG, getWhatsAppUrl } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

const enquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email').or(z.literal('')),
  message: z.string().min(5, 'Message must be at least 5 characters'),
});

type EnquiryForm = z.infer<typeof enquirySchema>;

export function EnquirySection() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryForm>({
    resolver: zodResolver(enquirySchema),
    defaultValues: { name: '', phone: '', email: '', message: '' },
  });

  const onSubmit = async (data: EnquiryForm) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('enquiries').insert({
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        message: data.message,
      });

      if (error) throw error;

      toast.success('Enquiry sent successfully! We\'ll get back to you soon.');
      reset();
    } catch {
      toast.error('Failed to send enquiry. Please try WhatsApp or call us directly.');
    }
  };

  return (
    <section id="enquiry" className="bg-navy py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left — Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-[var(--font-heading)] text-3xl font-extrabold text-white sm:text-4xl">
              Get In{' '}
              <span className="text-orange">Touch</span>
            </h2>
            <p className="mt-4 text-white/70 leading-relaxed">
              Have a question about our products? Need a bulk quote? Drop us a
              message or reach out directly — we&apos;re here to help!
            </p>

            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <MapPin className="h-5 w-5 text-orange" />
                </div>
                <div>
                  <p className="font-semibold text-white">Visit Us</p>
                  <p className="text-sm text-white/60">{SITE_CONFIG.contact.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Phone className="h-5 w-5 text-orange" />
                </div>
                <div>
                  <p className="font-semibold text-white">Call Us</p>
                  <a href={SITE_CONFIG.contact.phone1Link} className="block text-sm text-white/60 hover:text-white transition-colors">
                    {SITE_CONFIG.contact.phone1}
                  </a>
                  <a href={SITE_CONFIG.contact.phone2Link} className="block text-sm text-white/60 hover:text-white transition-colors">
                    {SITE_CONFIG.contact.phone2}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-whatsapp/20">
                  <MessageCircle className="h-5 w-5 text-whatsapp" />
                </div>
                <div>
                  <p className="font-semibold text-white">WhatsApp</p>
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    Chat with us instantly
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Mail className="h-5 w-5 text-orange" />
                </div>
                <div>
                  <p className="font-semibold text-white">Email</p>
                  <a
                    href={SITE_CONFIG.contact.emailLink}
                    className="text-sm text-white/60 hover:text-white transition-colors break-all"
                  >
                    {SITE_CONFIG.contact.email}
                  </a>
                </div>
              </div>
            </div>

            <Button
              asChild
              size="lg"
              className="mt-8 bg-whatsapp hover:bg-whatsapp-dark text-white font-semibold shadow-lg shadow-whatsapp/20"
            >
              <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" />
                WhatsApp Us Now
              </a>
            </Button>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="enquiry-name" className="text-white/80">Name *</Label>
                  <Input
                    id="enquiry-name"
                    placeholder="Your full name"
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-orange"
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-400">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enquiry-phone" className="text-white/80">Phone *</Label>
                  <Input
                    id="enquiry-phone"
                    placeholder="Your phone number"
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-orange"
                    {...register('phone')}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-400">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <Label htmlFor="enquiry-email" className="text-white/80">Email (optional)</Label>
                <Input
                  id="enquiry-email"
                  type="email"
                  placeholder="your@email.com"
                  className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-orange"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="mt-5 space-y-2">
                <Label htmlFor="enquiry-message" className="text-white/80">Message / Product Enquiry *</Label>
                <Textarea
                  id="enquiry-message"
                  rows={4}
                  placeholder="Tell us what you're looking for..."
                  className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-orange resize-none"
                  {...register('message')}
                />
                {errors.message && (
                  <p className="text-xs text-red-400">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full bg-orange hover:bg-orange-dark text-white font-semibold h-12 text-base shadow-lg shadow-orange/20"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Enquiry
                  </span>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
