import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DoctorCard } from '@/components/doctor-card';
import { ServiceCard } from '@/components/service-card';
import { ArrowRight, Clock, Users, Stethoscope, Calendar, Shield, Activity } from 'lucide-react';
import { getDoctors } from '@/lib/doctors';

export default async function HomePage() {
  const doctors = await getDoctors(3);

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
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Modern Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-slate-900 text-white rounded-b-[4rem] shadow-2xl">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -ml-32 -mb-32"></div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-primary-foreground backdrop-blur-md">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/80">Premium Healthcare System</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white">
              Your Health, <br />
              <span className="text-primary italic">Perfected.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto font-medium leading-relaxed">
              Connect with world-class specialists, manage your records, and experience care designed for your lifestyle.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link href="/register">
                <Button size="lg" className="h-16 px-10 text-lg font-black rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/20 transition-transform active:scale-95">
                  Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/doctors">
                <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-black rounded-2xl border-2 border-white/10 hover:bg-white/5 text-white transition-all">
                  Meet the Team
                </Button>
              </Link>
            </div>
          </div>

          {/* Impact Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto mt-24">
            {[
              { label: 'Verified Experts', value: '50+' },
              { label: 'Patient Reviews', value: '1.2k' },
              { label: 'Success Rate', value: '99%' },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <p className="text-4xl font-black text-white">{stat.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              A Healthier <span className="text-primary italic">Standard.</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
              We combine advanced medical intelligence with a human-centered approach.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx} className="p-10 border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem] hover:-translate-y-2 transition-all duration-500 group">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                    <Icon className="w-7 h-7 text-primary group-hover:text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-4">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">{item.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Specialists Spotlight */}
      <section className="py-24 bg-white/50 backdrop-blur-md rounded-[5rem] mx-6 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em]">
                <Activity className="w-4 h-4" />
                Featured Experts
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Our Medical <br /><span className="text-primary italic underline underline-offset-8 decoration-primary/10">Specialists</span>
              </h2>
            </div>
            <Link href="/doctors">
              <Button variant="ghost" className="font-black text-primary hover:bg-primary/5 px-8 h-14 rounded-2xl group transition-all">
                Global Directory <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {doctors.map((doctor: any) => (
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
            ))}
          </div>
        </div>
      </section>

      {/* Key Services Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Essential <span className="text-primary italic">Clinics.</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
              Verified clinical solutions tailored to your unique requirements.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ServiceCard
              icon="Stethoscope"
              title="General Practice"
              description="Primary healthcare and preventive medicine"
              features={['Check-ups', 'Vaccinations', 'Health screening']}
            />
            <ServiceCard
              icon="Calendar"
              title="Appointments"
              description="Easy online booking system"
              features={['Same-day', 'Schedule ahead', '24/7 available']}
            />
            <ServiceCard
              icon="Users"
              title="Specialists"
              description="Expert doctors in various fields"
              features={['Cardiology', 'Neurology', 'Pediatrics']}
            />
            <ServiceCard
              icon="Shield"
              title="Health Records"
              description="Secure digital health management"
              features={['Online access', 'Secure', 'Always updated']}
            />
          </div>
        </div>
      </section>

      {/* Final Action Card */}
      <section className="py-24 px-6 mb-24">
        <div className="max-w-7xl mx-auto">
          <Card className="p-16 md:p-24 bg-slate-900 text-white border-0 text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden rounded-[4rem]">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -ml-32 -mb-32"></div>

            <div className="max-w-3xl mx-auto relative z-10 space-y-12">
              <h2 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tighter">
                Take Command of <br />
                <span className="text-primary italic">Your Health.</span>
              </h2>
              <p className="text-xl md:text-2xl text-white/50 font-medium leading-relaxed">
                Experience healthcare designed for the future. Professional, secure, and ready for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/register">
                  <Button size="lg" className="h-20 px-14 text-xl font-black rounded-3xl bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/20 transition-transform hover:scale-105 active:scale-95 leading-none">
                    Join MediCare
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="h-20 px-14 text-xl font-black rounded-3xl border-2 border-white/10 hover:bg-white/5 transition-all text-white leading-none">
                    Consult Us
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


