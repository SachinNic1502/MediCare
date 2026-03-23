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
    <div className="space-y-12 pb-12">
      {/* Simple & Clean Header */}
      <section className="relative h-[280px] flex items-center px-12 overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-xl shadow-slate-200">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-blue-500/10 rounded-full blur-[80px] -ml-16 -mb-16"></div>

        <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="h-24 w-24 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg">
              <UserIcon className="w-12 h-12 text-primary" />
            </div>
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white">Your Health Profile</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                Welcome, <span className="text-blue-400 font-black">{user?.firstName || 'Back'}!</span>
              </h1>
              <p className="text-white/50 font-medium flex items-center gap-2 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Patient ID: <span className="text-white/80">MED-{user?.id?.slice(-6).toUpperCase()}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/doctors">
              <Button size="lg" className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 group transition-all">
                Book a Visit <Plus className="w-5 h-5 ml-2 group-hover:rotate-90 transition-transform duration-300" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="-mt-16 relative z-20 px-6">
        {/* Health Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Upcoming Visits', value: upcoming.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', status: 'Active' },
            { label: 'Past Visits', value: past.length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', status: 'Done' },
            { label: 'Heart Rate', value: '72', icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50', status: 'Normal', unit: 'bpm' },
            { label: 'Health Score', value: 'A+', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', status: 'Good' },
          ].map((stat, i) => (
            <Card key={i} className="p-6 border-none shadow-lg shadow-black/5 bg-white/95 backdrop-blur-sm rounded-3xl transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <Badge variant="secondary" className="font-bold text-[9px] uppercase tracking-wider">{stat.status}</Badge>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-foreground">{stat.value}</span>
                {stat.unit && <span className="text-xs font-bold text-muted-foreground ml-1">{stat.unit}</span>}
              </div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1">{stat.label}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between px-2">
              <div>
                <h2 className="text-3xl font-bold text-foreground tracking-tight">Your <span className="text-primary italic">Appointments</span></h2>
                <p className="text-sm text-muted-foreground font-medium">Your upcoming medical visits</p>
              </div>
              <Link href="/doctors">
                <Button variant="ghost" className="font-bold text-primary rounded-xl hover:bg-primary/5">
                  See All <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-40 rounded-3xl bg-white animate-pulse" />)}
              </div>
            ) : upcoming.length === 0 ? (
              <Card className="p-16 border-dashed border-2 border-muted bg-white/50 text-center rounded-[2.5rem]">
                <div className="bg-muted p-10 rounded-full w-fit mx-auto mb-6">
                  <Calendar className="w-12 h-12 text-muted-foreground opacity-30" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">No appointments yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-8 font-medium">
                  Please book a visit to see your appointment history here.
                </p>
                <Link href="/doctors">
                  <Button className="font-bold rounded-2xl h-14 px-10 bg-primary hover:bg-primary/90 text-white">
                    Book a Doctor
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-6">
                {upcoming.map((app) => (
                  <AppointmentCard
                    key={app._id}
                    id={app._id}
                    doctorName={app.doctorId?.name || 'Doctor'}
                    specialty={app.doctorId?.specialty || 'Specialist'}
                    date={new Date(app.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    time={app.time}
                    location={app.doctorId?.location || 'Medical Center'}
                    status={app.status}
                    notes={app.notes}
                    onCancel={() => handleCancelAppointment(app._id)}
                    onReschedule={() => router.push('/patient/book-appointment')}
                  />
                ))}
              </div>
            )}

            {/* Visit History */}
            {past.length > 0 && (
              <div className="pt-8 border-t border-muted/30">
                <h2 className="text-2xl font-bold text-foreground tracking-tight mb-6 px-2 italic">Past <span className="opacity-40">Visits</span></h2>
                <div className="space-y-4">
                  {past.slice(0, 3).map((app) => (
                    <Card key={app._id} className="p-6 bg-white border-none shadow-sm hover:shadow-md transition-all rounded-[1.8rem] flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50/10 flex items-center justify-center text-emerald-600">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground leading-tight text-lg">{app.doctorId?.name}</p>
                          <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wide">
                            {app.doctorId?.specialty} • {new Date(app.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" className="rounded-xl font-bold h-10 px-4 text-primary">View Report</Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card className="bg-slate-900 text-white p-8 border-none shadow-xl rounded-[2rem] relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                <Badge className="bg-primary text-white border-none px-3 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider">Upgrade Available</Badge>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold leading-tight">Get Better Health <br /><span className="text-blue-400 italic">Services Package</span></h3>
                  <p className="text-white/50 text-sm leading-relaxed">Upgrade to see expert doctors, get faster results, and enjoy 24/7 online support.</p>
                </div>
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold h-14 rounded-2xl transition-all">Check Now</Button>
              </div>
            </Card>

            {/* Updates Feed */}
            <Card className="p-8 border-none shadow-lg shadow-black/5 bg-white rounded-[2rem]">
              <h3 className="font-bold text-foreground text-[10px] uppercase tracking-widest flex items-center gap-2 mb-6 opacity-60">
                <Bell className="w-4 h-4 text-primary" />
                Health Updates
              </h3>
              <div className="space-y-6">
                {[
                  { title: 'Flu Season Alert', info: 'Protect your health today', type: 'Health Tip', icon: Stethoscope, color: 'text-rose-500', bg: 'bg-rose-50' },
                  { title: 'New Lab Updates', info: 'Check your latest test results', type: 'Lab News', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
                  { title: 'Specialist Opening', info: 'Dr. Evelyn Voss is now online', type: 'New Update', icon: UserIcon, color: 'text-violet-500', bg: 'bg-violet-50' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 group cursor-pointer">
                    <div className={`h-10 w-10 shrink-0 rounded-xl ${item.bg} ${item.color} flex items-center justify-center`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-primary uppercase tracking-wide">{item.type}</p>
                      <p className="text-sm font-bold text-foreground leading-tight">{item.title}</p>
                      <p className="text-[11px] font-medium text-muted-foreground opacity-80 leading-tight">{item.info}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-10 h-14 rounded-2xl border-2 border-dashed font-bold text-muted-foreground hover:text-primary transition-all text-sm">
                Mark All as Read
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>

  );
}
