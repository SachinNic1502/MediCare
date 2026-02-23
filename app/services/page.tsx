'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ServiceCard } from '@/components/service-card';
import { Heart, Bone, Brain, Baby, Smile, Eye, Stethoscope, Pill } from 'lucide-react';

const services = [
  {
    icon: Heart,
    title: 'Cardiology',
    description: 'Expert heart and cardiovascular care services.',
    features: ['Heart disease prevention', 'ECG and stress testing', 'Cardiac surgery consultation', '24/7 emergency care'],
  },
  {
    icon: Bone,
    title: 'Orthopedics',
    description: 'Comprehensive bone and joint treatment.',
    features: ['Joint replacement surgery', 'Sports medicine', 'Arthroscopy procedures', 'Physical rehabilitation'],
  },
  {
    icon: Brain,
    title: 'Neurology',
    description: 'Specialized neurological care and treatment.',
    features: ['Neurological disorder diagnosis', 'MRI and CT imaging', 'Stroke management', 'Seizure control'],
  },
  {
    icon: Baby,
    title: 'Pediatrics',
    description: 'Specialized healthcare for children.',
    features: ['Infant and child health', 'Vaccination programs', 'Growth monitoring', 'Emergency pediatric care'],
  },
  {
    icon: Smile,
    title: 'Dermatology',
    description: 'Skin health and cosmetic treatments.',
    features: ['Skin disease treatment', 'Cosmetic procedures', 'Laser therapy', 'Allergy testing'],
  },
  {
    icon: Eye,
    title: 'Ophthalmology',
    description: 'Complete eye care and vision services.',
    features: ['Vision correction', 'Cataract surgery', 'Glaucoma treatment', 'Eye disease management'],
  },
  {
    icon: Stethoscope,
    title: 'General Practice',
    description: 'Primary healthcare and preventive medicine.',
    features: ['Regular check-ups', 'Preventive care', 'Chronic disease management', 'Health screening'],
  },
  {
    icon: Pill,
    title: 'Pharmacy',
    description: 'Prescription and over-the-counter medications.',
    features: ['Prescription filling', 'Medicine consultation', 'Health supplements', 'Medication counseling'],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Our Services</h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive healthcare services for the entire family
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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

        {/* Additional Info Section */}
        <div className="p-8 bg-accent/10 rounded-lg border border-accent/20">
          <h2 className="text-2xl font-bold text-foreground mb-4">Why Choose MediCare</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Expert Doctors</h3>
              <p className="text-muted-foreground text-sm">
                Our team consists of highly qualified and experienced medical professionals.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Modern Equipment</h3>
              <p className="text-muted-foreground text-sm">
                We use state-of-the-art medical equipment for accurate diagnosis and treatment.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Patient Care</h3>
              <p className="text-muted-foreground text-sm">
                Your health and comfort are our top priorities in every aspect of care.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
