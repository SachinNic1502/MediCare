'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DoctorCard } from '@/components/doctor-card';
import { ServiceCard } from '@/components/service-card';
import { ArrowRight, Clock, Users, Stethoscope, Calendar, Shield, Activity } from 'lucide-react';

export default function HomePage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const response = await fetch('/api/doctors');
        const result = await response.json();
        if (result.success) {
          setDoctors(result.data);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, []);

  const highlights = [
    {
      icon: Clock,
      title: 'Easy Scheduling',
      description: 'Book appointments in minutes with our simple online system',
    },
    {
      icon: Users,
      title: 'Expert Doctors',
      description: 'Access to highly qualified medical professionals',
    },
    {
      icon: Shield,
      title: 'Secure Records',
      description: 'Your health information is protected and confidential',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight">
              Your Health is Our <span className="relative bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Priority
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse" />
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto text-balance leading-relaxed">
              Book appointments with our expert doctors, manage your health records, and receive quality care all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
              <Link href="/register">
                <Button size="lg" className="gap-3 px-8 py-6 text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-105 rounded-2xl">
                  Get Started <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/doctors">
                <Button size="lg" variant="outline" className="gap-3 px-8 py-6 text-lg border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-2xl">
                  View Doctors
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <p className="text-4xl font-bold text-primary mb-2">500+</p>
              <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Happy Patients</p>
            </div>
            <div className="group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <p className="text-4xl font-bold text-primary mb-2">50+</p>
              <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Expert Doctors</p>
            </div>
            <div className="group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <p className="text-4xl font-bold text-primary mb-2">10k+</p>
              <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Appointments</p>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="relative py-20 bg-white/30 backdrop-blur-md">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4">
              Why Choose Medi<span className="text-primary italic">.</span>Care
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
              Experience healthcare reimagined with cutting-edge technology and compassionate care
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx} className="group p-8 border-none shadow-xl shadow-primary/5 bg-white/80 backdrop-blur-sm hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 rounded-3xl">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Icon className="w-8 h-8 text-primary group-hover:text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed font-medium">{item.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="relative py-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="text-left">
              <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-2">
                <Activity className="w-4 h-4" />
                World Class Team
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                Our Medical <span className="text-primary underline decoration-primary/20 underline-offset-8 italic">Specialists</span>
              </h2>
            </div>
            <Link href="/doctors">
              <Button variant="ghost" className="font-bold text-primary hover:bg-primary/5 px-6 rounded-xl group group">
                View All Specialists <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="h-[450px] animate-pulse bg-muted/20 border-none rounded-3xl" />
              ))
            ) : (
              doctors.map((doctor) => (
                <DoctorCard
                  key={doctor._id}
                  id={doctor._id}
                  name={doctor.name}
                  specialty={doctor.specialty}
                  experience={doctor.experience}
                  location={doctor.location}
                  availability={doctor.availability}
                  rating={doctor.rating || 5.0}
                  reviews={doctor.reviews || 0}
                  image={doctor.image}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="relative py-20 bg-primary/5">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4">
              Specialized <span className="text-primary italic">Services</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
              Comprehensive healthcare solutions tailored to your unique medical needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ServiceCard
              icon={Stethoscope}
              title="General Practice"
              description="Primary healthcare and preventive medicine"
              features={['Check-ups', 'Vaccinations', 'Health screening']}
            />
            <ServiceCard
              icon={Calendar}
              title="Appointments"
              description="Easy online booking system"
              features={['Same-day', 'Schedule ahead', '24/7 available']}
            />
            <ServiceCard
              icon={Users}
              title="Specialists"
              description="Expert doctors in various fields"
              features={['Cardiology', 'Neurology', 'Pediatrics']}
            />
            <ServiceCard
              icon={Shield}
              title="Health Records"
              description="Secure digital health management"
              features={['Online access', 'Secure', 'Always updated']}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-16 bg-black text-white border-0 text-center shadow-2xl relative overflow-hidden rounded-[3rem]">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -ml-48 -mb-48 animate-pulse"></div>

            <div className="max-w-3xl mx-auto relative z-10">
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">Take Control of Your <br /><span className="text-primary italic underline decoration-white/20 underline-offset-8">Health Journey</span></h2>
              <p className="text-xl mb-12 text-white/70 font-medium leading-relaxed">
                Join thousands of patients who trust MediCare for their healthcare needs. Professional, secure, and always accessible.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="px-12 py-8 text-xl font-black shadow-2xl shadow-primary/40 transition-all duration-300 hover:scale-105 rounded-2xl bg-primary hover:bg-primary/90">
                    Sign Up Now
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="px-12 py-8 text-xl font-black border-2 border-white/20 hover:bg-white/10 transition-all duration-300 rounded-2xl text-white">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

