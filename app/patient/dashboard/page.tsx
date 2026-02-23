'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppointmentCard } from '@/components/appointment-card';
import { useAuth } from '@/lib/auth-context';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  Activity,
  User as UserIcon,
  ArrowRight,
  Stethoscope,
  ChevronRight,
  Bell,
  Heart,
  ShieldCheck,
  HeartPulse,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface Appointment {
  _id: string;
  doctorId: {
    name: string;
    specialty: string;
    location: string;
  };
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export default function PatientDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/appointments/patient?patientId=${user.id}`);
      const data = await response.json();
      if (data.success) {
        setAppointments(data.data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load your appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'patient') {
      router.push('/login');
      return;
    }
    fetchAppointments();
  }, [user, router]);

  const handleCancelAppointment = async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setAppointments(prev =>
          prev.map(apt =>
            apt._id === id ? { ...apt, status: 'cancelled' } : apt
          )
        );
        toast.success('Appointment cancelled successfully');
      } else {
        toast.error(data.error || 'Failed to cancel appointment');
      }
    } catch (error) {
      toast.error('Failed to cancel appointment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Activity className="w-10 h-10 text-primary animate-pulse mb-4" />
        <p className="text-muted-foreground font-bold">Synchronizing your health profile...</p>
      </div>
    );
  }

  const upcoming = appointments.filter(a => a.status === 'scheduled');
  const past = appointments.filter(a => a.status === 'completed');

  return (
    <div className="space-y-10">
      {/* Top Banner - Hero Section */}
      <div className="bg-black p-12 text-white relative overflow-hidden rounded-[3rem]">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -mr-64 -mt-64 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <div className="h-24 w-24 rounded-3xl bg-primary/10 backdrop-blur-xl flex items-center justify-center border border-white/10 shadow-2xl relative group cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <UserIcon className="w-12 h-12 text-primary relative z-10" />
              </div>
              <div>
                <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-[0.2em] mb-2">
                  <Activity className="w-4 h-4" />
                  Patient Dashboard
                </div>
                <h1 className="text-5xl font-black tracking-tight leading-none mb-2">
                  Welcome back, <span className="text-primary italic underline decoration-primary/20 underline-offset-8">{user?.firstName || 'Guest'}</span>
                </h1>
                <p className="text-white/60 font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Patient ID: MED-{user?.id?.slice(-6).toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/patient/appointments">
                <Button variant="outline" className="font-black rounded-2xl h-16 px-8 border-2 border-white/10 hover:bg-white/5 transition-all text-white">
                  My Profile
                </Button>
              </Link>
              <Link href="/doctors">
                <Button size="lg" className="font-black rounded-2xl h-16 px-10 shadow-2xl shadow-primary/40 group bg-primary hover:bg-primary/90 text-white">
                  Book Appointment <Plus className="w-5 h-5 ml-2 group-hover:rotate-90 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="-mt-20 relative z-20 px-4">
        {/* Vital Health Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <Card className="p-8 border-none shadow-2xl shadow-primary/5 bg-white rounded-[2rem] group hover:-translate-y-2 transition-all duration-300 ring-1 ring-black/5 hover:ring-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600">
                <Calendar className="w-6 h-6" />
              </div>
              <Badge className="bg-blue-500/10 text-blue-600 border-none">Active</Badge>
            </div>
            <p className="text-4xl font-black text-foreground mb-1">{upcoming.length}</p>
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Upcoming Appts</p>
          </Card>

          <Card className="p-8 border-none shadow-2xl shadow-primary/5 bg-white rounded-[2rem] group hover:-translate-y-2 transition-all duration-300 ring-1 ring-black/5 hover:ring-emerald-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-none">Past</Badge>
            </div>
            <p className="text-4xl font-black text-foreground mb-1">{past.length}</p>
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Past Visits</p>
          </Card>

          <Card className="p-8 border-none shadow-2xl shadow-primary/5 bg-white rounded-[2rem] group hover:-translate-y-2 transition-all duration-300 ring-1 ring-black/5 hover:ring-rose-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600">
                <HeartPulse className="w-6 h-6" />
              </div>
              <Badge className="bg-rose-500/10 text-rose-600 border-none">Vitals</Badge>
            </div>
            <p className="text-4xl font-black text-foreground mb-1">98.2<span className="text-base text-muted-foreground ml-1 text-xs">bpm</span></p>
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Heart Rate</p>
          </Card>

          <Card className="p-8 border-none shadow-2xl shadow-primary/5 bg-white rounded-[2rem] group hover:-translate-y-2 transition-all duration-300 ring-1 ring-black/5 hover:ring-amber-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
                <Activity className="w-6 h-6" />
              </div>
              <Badge className="bg-amber-500/10 text-amber-600 border-none">Health</Badge>
            </div>
            <p className="text-4xl font-black text-foreground mb-1">A+</p>
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Health Score</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Dashboard Feed */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-foreground tracking-tight">Upcoming <span className="text-primary italic">Appointments</span></h2>
                <p className="text-sm text-muted-foreground font-bold">Your scheduled visits for this month</p>
              </div>
              <Link href="/doctors">
                <Button variant="ghost" className="font-black text-primary group rounded-xl px-6">
                  View All <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-40 rounded-[2rem] bg-white animate-pulse"></div>)}
              </div>
            ) : upcoming.length === 0 ? (
              <Card className="p-20 border-dashed border-4 border-muted bg-white/50 text-center rounded-[3rem]">
                <div className="bg-muted p-10 rounded-full w-fit mx-auto mb-8 shadow-inner">
                  <Calendar className="w-20 h-20 text-muted-foreground opacity-20" />
                </div>
                <h3 className="text-3xl font-black text-foreground mb-4 tracking-tight">No active appointments</h3>
                <p className="text-lg text-muted-foreground max-w-sm mx-auto mb-10 font-medium">
                  Maintaining health through regular checkups is important.
                </p>
                <Link href="/doctors">
                  <Button className="font-black rounded-2xl h-16 px-12 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white text-lg">
                    Find a Doctor
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {upcoming.map((app) => (
                  <AppointmentCard
                    key={app._id}
                    id={app._id}
                    doctorName={app.doctorId?.name || 'Unknown Specialist'}
                    specialty={app.doctorId?.specialty || 'Medical Professional'}
                    date={new Date(app.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    time={app.time}
                    location={app.doctorId?.location || 'Main Hospital Wing'}
                    status={app.status}
                    notes={app.notes}
                    onCancel={() => handleCancelAppointment(app._id)}
                    onReschedule={() => router.push('/patient/book-appointment')}
                  />
                ))}
              </div>
            )}

            {/* Medical Timeline (Archive) */}
            {past.length > 0 && (
              <div className="pt-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-8 w-1 bg-primary rounded-full"></div>
                  <h2 className="text-3xl font-black text-foreground tracking-tight">Clinical <span className="text-primary italic text-2xl opacity-60">History</span></h2>
                </div>
                <div className="grid grid-cols-1 gap-4 opacity-70 group hover:opacity-100 transition-opacity">
                  {past.slice(0, 3).map((app) => (
                    <div key={app._id} className="p-6 bg-white rounded-[2rem] shadow-sm border border-transparent hover:border-primary/20 transition-all flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-black text-foreground text-lg">{app.doctorId?.name}</p>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{app.doctorId?.specialty} • {new Date(app.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button variant="ghost" className="rounded-xl font-bold h-10 px-4">View Report</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Health Intelligence Sidebar */}
          <div className="space-y-8">
            <Card className="bg-primary text-white p-10 border-none shadow-[0_30px_60px_-15px_rgba(var(--primary-rgb),0.3)] relative overflow-hidden rounded-[2.5rem] group">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <HeartPulse className="w-32 h-32 -mr-8 -mt-8 rotate-12 group-hover:scale-125 transition-transform duration-700" />
              </div>
              <div className="relative z-10">
                <Badge className="bg-white/20 text-white border-none mb-6 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">Priority Care</Badge>
                <h3 className="text-3xl font-black mb-4 leading-tight">Elevate Your<br /><span className="italic underline underline-offset-8 decoration-white/20">Stability Registry</span></h3>
                <p className="text-white/70 font-bold mb-10 leading-relaxed">Unlock advanced diagnostics, genomic screening, and 24/7 dedicated medical concierge.</p>
                <Button className="w-full bg-white text-primary hover:bg-white/90 font-black h-14 rounded-2xl shadow-xl shadow-black/10">Upgrade Bio-Profile</Button>
              </div>
            </Card>

            {/* Health Tips / Notifications */}
            <Card className="p-8 border-none shadow-2xl shadow-primary/5 bg-white rounded-[2.5rem]">
              <h3 className="font-black text-foreground mb-6 uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Health Awareness
              </h3>
              <div className="space-y-6">
                {[
                  { title: 'Flu Season Precautions', type: 'Clinical Tip', icon: Stethoscope },
                  { title: 'Annual Lab Work Reminder', type: 'Pending Protocol', icon: FileText },
                  { title: 'New Specialist Available', type: 'Network Update', icon: UserIcon }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group cursor-pointer">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">{item.type}</p>
                      <p className="text-sm font-black text-foreground line-clamp-1">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-10 h-14 font-black rounded-2xl border-2 border-dashed text-muted-foreground hover:text-primary transition-all">
                Dismiss All Alerts
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>

  );
}
