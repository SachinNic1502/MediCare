'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Stethoscope, Phone, Mail, MapPin, Clock, CheckCircle2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the form data to a server
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-background py-8 md:py-14 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        {/* Success Dialog */}
        <Dialog open={submitted} onOpenChange={setSubmitted}>
          <DialogContent className="w-[calc(100%-3rem)] sm:max-w-md rounded-[2.5rem] md:rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white mx-auto">
            <div className="p-8 md:p-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-3xl bg-primary/10 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-primary" />
              </div>
              <DialogTitle className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">Message Sent!</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium text-base md:text-lg mb-8 leading-relaxed">
                Thank you for reaching out. Our team will respond within 24 hours.
              </DialogDescription>
              <Button 
                onClick={() => setSubmitted(false)}
                className="w-full h-14 md:h-16 rounded-2xl md:rounded-[1.2rem] bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 text-xs md:text-sm"
              >
                Return to Page
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-3">
            Contact <span className="text-primary italic">Us.</span>
          </h1>
          <p className="text-slate-500 text-base md:text-lg font-medium max-w-xl leading-relaxed opacity-80">
            Have questions about our clinical services? Send us a message and our specialists will respond shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
          {/* Contact Info */}
          <div className="lg:col-span-4 space-y-4 md:space-y-5">
            {[
              { id: 'phone', label: 'Direct Line', val: '+1 (800) 123-4567', sub: 'Mon-Fri, 9AM-6PM EST', icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50' },
              { id: 'email', label: 'Email Registry', val: 'info@medicare.com', sub: 'support@medicare.com', icon: Mail, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { id: 'location', label: 'Clinical Center', val: '123 Medical Drive', sub: 'New York, NY 10001', icon: MapPin, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((item) => (
              <Card key={item.id} className="p-6 border-slate-100 bg-white shadow-xl shadow-slate-200/40 rounded-[1.5rem] md:rounded-[2rem] group hover:bg-slate-50/50 transition-colors">
                <div className="flex gap-5 items-center">
                  <div className={`w-12 h-12 rounded-xl md:rounded-2xl ${item.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    <item.icon className={`w-5 h-5 md:w-6 md:h-6 ${item.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-black text-slate-900 mb-0.5 tracking-tight uppercase opacity-40">{item.label}</h3>
                    <p className="text-slate-900 font-black text-sm md:text-lg leading-tight">{item.val}</p>
                    <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">{item.sub}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-8">
            <Card className="p-6 md:p-10 border-slate-50 bg-white shadow-2xl shadow-slate-200/50 rounded-[2rem] md:rounded-[2.5rem]">
              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full h-12 md:h-14 px-5 md:px-6 border-2 border-slate-50 bg-slate-50 rounded-xl md:rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold placeholder:text-slate-200 outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full h-12 md:h-14 px-5 md:px-6 border-2 border-slate-50 bg-slate-50 rounded-xl md:rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold placeholder:text-slate-200 outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full h-12 md:h-14 px-5 md:px-6 border-2 border-slate-50 bg-slate-50 rounded-xl md:rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold placeholder:text-slate-200 outline-none"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Subject Matter
                    </label>
                    <div className="relative">
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full h-12 md:h-14 px-5 md:px-6 border-2 border-slate-50 bg-slate-50 rounded-xl md:rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-xs md:text-sm font-bold outline-none appearance-none"
                      >
                        <option value="">Select a subject</option>
                        <option value="appointment">Appointment Inquiry</option>
                        <option value="billing">Billing Question</option>
                        <option value="medical">Medical Question</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <X className="w-4 h-4 rotate-45" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Describe Your Inquiry
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full p-5 md:p-6 border-2 border-slate-50 bg-slate-50 rounded-[1.5rem] md:rounded-[2rem] focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold placeholder:text-slate-200 outline-none resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 md:h-16 rounded-xl md:rounded-[1.2rem] bg-primary text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 text-[10px]"
                >
                  Terminate Submission & Send
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
