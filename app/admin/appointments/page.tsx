'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import {
  Calendar,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  MoreVertical,
  Activity,
  RefreshCcw,
  ArrowUpRight,
  User as UserIcon,
  Stethoscope,
  Trash2
} from 'lucide-react';

interface Appointment {
  _id: string;
  patientId: { firstName: string; lastName: string; email: string };
  doctorId: { name: string; specialty: string };
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export default function AdminAppointmentsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and is an admin
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    const fetchAppointments = async () => {
      try {
        const response = await fetch('/api/appointments');
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

  const specialties = Array.from(new Set(appointments.map(a => a.doctorId?.specialty))).filter(Boolean);

  const handleStatusChange = async (id: string, newStatus: 'scheduled' | 'completed' | 'cancelled') => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        setAppointments((prev) =>
          prev.map((apt) => (apt._id === id ? { ...apt, status: newStatus } : apt))
        );
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const isWithinDateRange = (dateStr: string, range: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (range === 'today') {
      return date.toDateString() === today.toDateString();
    }
    if (range === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return date.toDateString() === tomorrow.toDateString();
    }
    if (range === 'thisWeek') {
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() + 7);
      return date >= today && date <= weekEnd;
    }
    if (range === 'thisMonth') {
      return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    }
    return true;
  };

  const filteredAppointments = appointments
    .filter((apt) => (filterStatus === 'all' ? true : apt.status === filterStatus))
    .filter((apt) => (filterSpecialty === 'all' ? true : apt.doctorId?.specialty === filterSpecialty))
    .filter((apt) => isWithinDateRange(apt.date, filterDate))
    .filter((apt) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        `${apt.patientId?.firstName} ${apt.patientId?.lastName}`.toLowerCase().includes(search) ||
        apt.doctorId?.name.toLowerCase().includes(search) ||
        apt._id.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'name-asc') return `${a.patientId?.firstName}`.localeCompare(`${b.patientId?.firstName}`);
      return 0;
    });

  const statusBadgeColor: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  };

  const statusIcons: Record<string, any> = {
    scheduled: <Clock className="w-4 h-4" />,
    completed: <CheckCircle className="w-4 h-4" />,
    cancelled: <XCircle className="w-4 h-4" />,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-3">
            <Calendar className="w-4 h-4" />
            Global Scheduler
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Visit <span className="text-primary italic">Control.</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">Monitor and manage all clinical sessions and patient logs</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="rounded-2xl font-black gap-2 h-14 px-8 bg-white border-2 border-slate-100 text-slate-900 hover:bg-slate-50 transition-all font-display"
            onClick={() => {
              setRefreshing(true);
              fetch('/api/appointments')
                .then((response) => response.json())
                .then((data) => {
                  if (data.success) {
                    setAppointments(data.data);
                  }
                })
                .finally(() => setRefreshing(false));
            }}
            disabled={refreshing}
          >
            <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''} text-primary`} />
            Refresh Registry
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Volume', value: appointments.length, icon: Activity, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'Pending Visits', value: appointments.filter(a => a.status === 'scheduled').length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Terminated', value: appointments.filter(a => a.status === 'cancelled').length, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat) => (
          <Card key={stat.label} className="p-8 border border-slate-50 bg-white shadow-xl shadow-slate-200/50 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-1 group relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className={`h-14 w-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <Badge className={`${stat.bg} ${stat.color} border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg`}>
                  Metric
                </Badge>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card className="border border-slate-50 bg-white shadow-xl shadow-slate-200/50 rounded-[3rem] overflow-hidden">
        <div className="p-10 border-b border-slate-50 bg-slate-50/30 space-y-10">
          <div className="flex flex-col xl:flex-row gap-8 items-center justify-between">
            <div className="relative group w-full xl:max-w-2xl">
              <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search by patient identity, Case ID, or assigned expert..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-20 pr-10 h-20 bg-white border-none rounded-[2rem] text-xl font-black text-slate-900 shadow-sm focus:ring-8 focus:ring-primary/5 transition-all placeholder:text-slate-300 outline-none"
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 w-full xl:w-auto overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Records', icon: Activity },
                { id: 'scheduled', label: 'Scheduled', icon: Clock },
                { id: 'completed', label: 'Completed', icon: CheckCircle },
                { id: 'cancelled', label: 'Cancelled', icon: XCircle },
              ].map((filter) => {
                const Icon = filter.icon;
                const active = filterStatus === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setFilterStatus(filter.id)}
                    className={`
                      flex items-center gap-4 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 shrink-0
                      ${active 
                        ? 'bg-slate-900 text-white shadow-2xl shadow-slate-200 scale-[1.05]' 
                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                  >
                    <Icon className={`w-4 h-4 transition-colors ${active ? 'text-primary' : 'text-slate-300'}`} />
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Time:</span>
               <select 
                value={filterDate} 
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-transparent border-none text-xs font-black text-slate-900 outline-none pr-8 cursor-pointer appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '1.2em' }}
               >
                 <option value="all">Any Date</option>
                 <option value="today">Today Only</option>
                 <option value="tomorrow">Tomorrow</option>
                 <option value="thisWeek">Next 7 Days</option>
                 <option value="thisMonth">Current Month</option>
               </select>
            </div>

            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Expertise:</span>
               <select 
                value={filterSpecialty} 
                onChange={(e) => setFilterSpecialty(e.target.value)}
                className="bg-transparent border-none text-xs font-black text-slate-900 outline-none pr-8 cursor-pointer appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '1.2em' }}
               >
                 <option value="all">All Specialties</option>
                 {specialties.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
            </div>

            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm ml-auto">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Sort:</span>
               <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-xs font-black text-slate-900 outline-none pr-8 cursor-pointer appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394a3b8\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '1.2em' }}
               >
                 <option value="date-desc">Newest First</option>
                 <option value="date-asc">Oldest First</option>
                 <option value="name-asc">Patient Name</option>
               </select>
            </div>

            <Button
              variant="ghost"
              onClick={() => {
                setFilterStatus('all');
                setFilterDate('all');
                setFilterSpecialty('all');
                setSortBy('date-desc');
                setSearchTerm('');
              }}
              className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 rounded-xl px-4 h-10"
            >
              Reset Filters
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Patient / Case ID</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Expert</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Timing Window</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Registry Status</th>
                <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Entry Logs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-40">
                      <div className="p-10 rounded-full bg-slate-50 border-2 border-dashed border-slate-100">
                        <Calendar className="w-16 h-16 text-slate-200" />
                      </div>
                      <p className="text-xl font-black text-slate-900 tracking-tight">Null Registry History</p>
                      <p className="text-sm font-medium text-slate-400 -mt-4">Adjust your filters or search terms</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                    <tr key={apt._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-sm">
                            {apt.patientId?.firstName?.[0]}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-lg leading-tight">
                              {apt.patientId?.firstName} {apt.patientId?.lastName}
                            </p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 opacity-60">
                              CASE-#{apt._id.slice(-6).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <Stethoscope className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{apt.doctorId?.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{apt.doctorId?.specialty}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <div className="inline-flex flex-col items-center bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                          <span className="text-sm font-black text-slate-900">{apt.time}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {new Date(apt.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <Badge className={`
                          px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-none
                          ${apt.status === 'scheduled' ? 'bg-blue-50 text-blue-600' : 
                            apt.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
                            'bg-rose-50 text-rose-600'}
                        `}>
                          {apt.status}
                        </Badge>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {apt.status === 'scheduled' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-12 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all px-6"
                                onClick={() => handleStatusChange(apt._id, 'completed')}
                              >
                                Complete
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-12 rounded-2xl font-black text-xs uppercase tracking-widest border-2 border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white transition-all px-6"
                                onClick={() => handleStatusChange(apt._id, 'cancelled')}
                              >
                                Terminate
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all border border-slate-100"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
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
