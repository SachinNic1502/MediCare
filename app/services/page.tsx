'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ServiceCard } from '@/components/service-card';
import { Heart, Bone, Brain, Baby, Smile, Eye, Stethoscope, Pill } from 'lucide-react';

const services: Array<{
  icon: "Heart" | "Bone" | "Brain" | "Baby" | "Smile" | "Eye" | "Stethoscope" | "Pill";
  title: string;
  description: string;
  features: string[];
}> = [
  {
    icon: 'Heart',
    title: 'Cardiology',
    description: 'Expert heart and cardiovascular care services.',
    features: ['Heart disease prevention', 'ECG and stress testing', 'Cardiac surgery consultation', '24/7 emergency care'],
  },
  {
    icon: 'Bone',
    title: 'Orthopedics',
    description: 'Comprehensive bone and joint treatment.',
    features: ['Joint replacement surgery', 'Sports medicine', 'Arthroscopy procedures', 'Physical rehabilitation'],
  },
  {
    icon: 'Brain',
    title: 'Neurology',
    description: 'Specialized neurological care and treatment.',
    features: ['Neurological disorder diagnosis', 'MRI and CT imaging', 'Stroke management', 'Seizure control'],
  },
  {
    icon: 'Baby',
    title: 'Pediatrics',
    description: 'Specialized healthcare for children.',
    features: ['Infant and child health', 'Vaccination programs', 'Growth monitoring', 'Emergency pediatric care'],
  },
  {
    icon: 'Smile',
    title: 'Dermatology',
    description: 'Skin health and cosmetic treatments.',
    features: ['Skin disease treatment', 'Cosmetic procedures', 'Laser therapy', 'Allergy testing'],
  },
  {
    icon: 'Eye',
    title: 'Ophthalmology',
    description: 'Complete eye care and vision services.',
    features: ['Vision correction', 'Cataract surgery', 'Glaucoma treatment', 'Eye disease management'],
  },
  {
    icon: 'Stethoscope',
    title: 'General Practice',
    description: 'Primary healthcare and preventive medicine.',
    features: ['Regular check-ups', 'Preventive care', 'Chronic disease management', 'Health screening'],
  },
  {
    icon: 'Pill',
    title: 'Pharmacy',
    description: 'Prescription and over-the-counter medications.',
    features: ['Prescription filling', 'Medicine consultation', 'Health supplements', 'Medication counseling'],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24">
      {/* Header Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6">
          <Stethoscope className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Medical Excellence</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight mb-6">
          Clinical <span className="text-primary italic">Intelligence.</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Comprehensive, specialized healthcare solutions delivered by global medical specialists.
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-24">
          {services.map((service, idx) => (
            <ServiceCard
              key={idx}
              icon={service.icon}
              title={service.title}
              description={service.description}
              features={service.features}
            />
          ))}
        </div>

        {/* Why Choose Section */}
        <Card className="p-16 bg-slate-900 text-white rounded-[4rem] border-none shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-12 tracking-tight">The MediCare <span className="text-primary italic underline decoration-white/20 underline-offset-8">Standard.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { title: 'Certified Experts', desc: 'Our team consists of highly qualified and verified medical specialists.', icon: Stethoscope },
                { title: 'Global Technology', desc: 'We utilize state-of-the-art clinical tools for precise diagnostics.', icon: Brain },
                { title: 'Dedicated Care', desc: 'Your health and safety remain our primary focus in every consultation.', icon: Heart }
              ].map((item, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider text-xs opacity-70">Category {i + 1}</h3>
                  <h3 className="text-2xl font-black text-white">{item.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
