'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card } from '@/components/ui/card';
import { AppointmentCard } from '@/components/appointment-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { Calendar, Search, Filter, ArrowLeft, ArrowRight, RefreshCcw, Plus, Clock, CheckCircle } from 'lucide-react';

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

export default function PatientAppointments() {
  const router = useRouter();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'patient') {
      router.push('/login');
      return;
    }
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`/api/appointments/patient?patientId=${user.id}`);
        const data = await response.json();
        if (data.success) {
          setAppointments(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user, router]);

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = !searchTerm ||
      apt.doctorId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctorId.specialty.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

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
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-1">
            <Calendar className="w-4 h-4" />
            Patient Records
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">
            My <span className="text-primary italic">Appointments</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage and track your healthcare journey</p>
        </div>
        <Button 
          onClick={() => router.push('/patient/book-appointment')}
          className="rounded-xl font-bold h-12 px-6 shadow-xl shadow-primary/20 bg-primary text-white hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Book New Appointment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6 border-none shadow-sm bg-white rounded-2xl group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-slate-500/10 text-slate-600">
              <Calendar className="h-6 w-6" />
            </div>
            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter">Total</Badge>
          </div>
          <p className="text-3xl font-black text-foreground">{appointments.length}</p>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Record History</p>
        </Card>

        <Card className="p-6 border-none shadow-sm bg-white rounded-2xl group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
              <Clock className="h-6 w-6" />
            </div>
            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter text-blue-600 border-blue-200">Pending</Badge>
          </div>
          <p className="text-3xl font-black text-foreground">
            {appointments.filter(a => a.status === 'scheduled').length}
          </p>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Upcoming Visits</p>
        </Card>

        <Card className="p-6 border-none shadow-sm bg-white rounded-2xl group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter text-emerald-600 border-emerald-200">Success</Badge>
          </div>
          <p className="text-3xl font-black text-foreground">
            {appointments.filter(a => a.status === 'completed').length}
          </p>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Completed Consults</p>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="p-4 mb-8 border-none shadow-sm bg-white rounded-2xl">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by doctor or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {['all', 'scheduled', 'completed', 'cancelled'].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className={`rounded-xl px-5 font-black text-[10px] uppercase tracking-widest h-11 ${
                  filterStatus === status 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Appointments Grid/Table */}
      <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Specialist</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Schedule</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Calendar className="w-16 h-16" />
                      <p className="text-xl font-black">No matching records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black">
                          {appointment.doctorId.name[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg leading-tight">{appointment.doctorId.name}</p>
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">{appointment.doctorId.specialty}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" /> {appointment.time}
                        </span>
                        <span className="text-xs font-bold text-slate-400 mt-1 italic">
                          {new Date(appointment.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <Badge className={`
                        px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border-none
                        ${appointment.status === 'scheduled' ? 'bg-blue-500/10 text-blue-600' : 
                          appointment.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : 
                          'bg-rose-500/10 text-rose-600'}
                      `}>
                        {appointment.status}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {appointment.status === 'scheduled' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push('/patient/book-appointment')}
                              className="h-10 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-100"
                            >
                              Reschedule
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelAppointment(appointment._id)}
                              className="h-10 rounded-xl font-black text-[10px] uppercase tracking-widest text-rose-500 hover:bg-rose-50"
                            >
                              Abort
                            </Button>
                          </>
                        )}
                        {appointment.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 rounded-xl font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/5"
                          >
                            View Report
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
