'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Users,
  Calendar,
  Stethoscope,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Clock,
  RefreshCcw,
  CreditCard,
  Plus,
  Check
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface AdminStats {
  totalPatients: number;
  totalAppointments: number;
  totalDoctors: number;
  revenue: string;
}

interface RecentAppointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<RecentAppointment[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  // Payment states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAptId, setSelectedAptId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<string>('cash');
  const [creating, setCreating] = useState(false);
  const [availableApts, setAvailableApts] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setRecentAppointments(data.recentAppointments);
        setTrendData(data.trendData);
      } else {
        toast.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('An error occurred while loading dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAvailableApts = async () => {
    try {
      const res = await fetch('/api/appointments?status=scheduled&limit=20');
      const data = await res.json();
      if (data.success) setAvailableApts(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchData();
    fetchAvailableApts();
  }, [user, router]);

  const handleRecordPayment = async () => {
    if (!selectedAptId || !amount) {
      toast.error('Details incomplete');
      return;
    }

    try {
      setCreating(true);
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: selectedAptId,
          amount: parseFloat(amount),
          paymentMethod: method,
          status: (method === 'cash' || method === 'bank_transfer') ? 'paid' : 'pending'
        })
      });

      if ((await res.json()).success) {
        toast.success('Payment recorded successfully');
        setIsDialogOpen(false);
        fetchData(); // Refresh stats
        setSelectedAptId('');
        setAmount('');
      } else {
        toast.error('Failed to record payment');
      }
    } catch (e) {
      toast.error('Network error');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground font-medium animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  const dashboardStats = [
    {
      label: 'Total Patients',
      value: stats?.totalPatients || 0,
      icon: Users,
      color: 'text-blue-600',
      trend: '+12.5%',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'Appointments',
      value: stats?.totalAppointments || 0,
      icon: Calendar,
      color: 'text-emerald-600',
      trend: '+8.2%',
      bg: 'bg-emerald-500/10'
    },
    {
      label: 'Active Doctors',
      value: stats?.totalDoctors || 0,
      icon: Stethoscope,
      color: 'text-violet-600',
      trend: 'Stable',
      bg: 'bg-violet-500/10'
    },
    {
      label: 'Total Revenue',
      value: stats?.revenue || '$0',
      icon: TrendingUp,
      color: 'text-amber-600',
      trend: '+15.3%',
      bg: 'bg-amber-500/10'
    },
  ];

  const statusBadgeColor: Record<string, string> = {
    scheduled: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    cancelled: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-3">
            <Activity className="w-4 h-4" />
            Operational Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Admin <span className="text-primary italic">Control.</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">Hospital management & performance overview</p>
        </div>
        <div className="flex items-center gap-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl gap-2 font-black h-14 px-8 shadow-xl shadow-primary/20 bg-primary text-white hover:bg-primary/90 transition-all active:scale-95">
                <Plus className="w-5 h-5 mr-1" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl rounded-[3.5rem] border-none shadow-2xl p-1 bg-white overflow-hidden text-slate-900">
              <div className="bg-slate-50/50 p-10 flex items-center justify-between shrink-0 border-b border-slate-100 rounded-t-[3.4rem]">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Record Entry.</h2>
                  <p className="text-slate-500 font-medium text-sm mt-1 font-display">Log a new clinical transaction into the registry</p>
                </div>
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-white shadow-xl hover:bg-slate-900 hover:text-white transition-all" onClick={() => setIsDialogOpen(false)}>
                  <Plus className="w-5 h-5 rotate-45" />
                </Button>
              </div>
              <div className="p-10 space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Assigned Case / Visit</Label>
                  <Select value={selectedAptId} onValueChange={(val) => {
                    setSelectedAptId(val);
                    const apt = availableApts.find(a => a._id === val);
                    if (apt) setAmount((apt.consultationFee || apt.doctorId?.consultationFee || '').toString());
                  }}>
                    <SelectTrigger className="h-14 rounded-2xl font-black border-2 border-slate-50 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-lg pl-6">
                      <SelectValue placeholder="Pick an active case..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white/95 backdrop-blur-xl">
                      {availableApts.map(a => (
                        <SelectItem key={a._id} value={a._id} className="rounded-xl font-bold py-3 px-4 hover:bg-slate-50 text-slate-700">
                          {a.patientId?.firstName} vs {a.doctorId?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Fee Amount ($)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="h-14 rounded-2xl font-black border-2 border-slate-50 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-2xl pl-6"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Payment Channel</Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger className="h-14 rounded-2xl font-black border-2 border-slate-50 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-lg pl-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white/95 backdrop-blur-xl">
                      <SelectItem value="credit_card" className="rounded-xl font-bold py-3 px-4 hover:bg-slate-50 text-slate-700">Credit / Debit Instrument</SelectItem>
                      <SelectItem value="bank_transfer" className="rounded-xl font-bold py-3 px-4 hover:bg-slate-50 text-slate-700">Direct Bank Transfer</SelectItem>
                      <SelectItem value="cash" className="rounded-xl font-bold py-3 px-4 hover:bg-slate-50 text-slate-700">Cash Settlement</SelectItem>
                      <SelectItem value="insurance" className="rounded-xl font-bold py-3 px-4 hover:bg-slate-50 text-slate-700">Insurance Coverage Claim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="p-10 pt-0 bg-white">
                <Button
                  className="w-full h-20 rounded-[1.8rem] font-black uppercase tracking-widest shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white transition-all active:scale-95 leading-none"
                  onClick={handleRecordPayment}
                  disabled={creating}
                >
                  {creating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : 'Finalize Payment Entry'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            className="rounded-2xl font-black gap-2 h-14 px-8 bg-white border-2 border-slate-100 text-slate-900 hover:bg-slate-50 transition-all"
            onClick={fetchData}
            disabled={refreshing}
          >
            <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''} text-primary`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-8 border border-slate-50 bg-white shadow-xl shadow-slate-200/50 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-1 group relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 rounded-full ${stat.bg} blur-3xl group-hover:scale-150 transition-transform duration-700`}></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className={`h-14 w-14 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 ${stat.color}`} />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">
                    {stat.trend}
                  </Badge>
                </div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">{stat.label}</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-10 border border-slate-50 bg-white shadow-xl shadow-slate-200/50 rounded-[3rem] h-[450px]">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Visit Trends</h3>
              <p className="text-sm text-slate-400 font-medium">Daily volume of hospital visits</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl">
              <Button variant="ghost" size="sm" className="h-10 text-[10px] font-black px-6 rounded-xl hover:bg-white transition-all uppercase tracking-widest">Day</Button>
              <Button variant="secondary" size="sm" className="h-10 text-[10px] font-black px-6 rounded-xl bg-white shadow-sm text-primary uppercase tracking-widest">Week</Button>
              <Button variant="ghost" size="sm" className="h-10 text-[10px] font-black px-6 rounded-xl hover:bg-white transition-all uppercase tracking-widest">Month</Button>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                />
                <Tooltip
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                    padding: '16px 24px'
                  }}
                  itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="appointments"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorTrend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-10 border border-slate-50 bg-white shadow-xl shadow-slate-200/50 rounded-[3rem] h-[450px]">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Daily Flow</h3>
              <p className="text-sm text-slate-400 font-medium">Revenue metrics by day</p>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                />
                <Tooltip
                  cursor={{ fill: '#3b82f6', opacity: 0.05 }}
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                    padding: '16px 24px'
                  }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Global Controls & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

        <div className="space-y-8">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 px-2">
            <Activity className="w-5 h-5 text-primary" />
            Global Controls
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <Link href="/admin/doctors">
              <Button variant="ghost" className="w-full justify-between gap-4 h-20 rounded-[1.8rem] bg-white border-2 border-slate-50 hover:border-primary/20 hover:bg-primary/5 text-slate-900 font-black group transition-all duration-500 shadow-sm px-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-primary group-hover:text-white transition-all duration-500 flex items-center justify-center">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm">Manage Doctors</span>
                    <span className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase">52 Active Pros</span>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-primary" />
              </Button>
            </Link>
            <Link href="/admin/patients">
              <Button variant="ghost" className="w-full justify-between gap-4 h-20 rounded-[1.8rem] bg-white border-2 border-slate-50 hover:border-primary/20 hover:bg-primary/5 text-slate-900 font-black group transition-all duration-500 shadow-sm px-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-all duration-500 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm">Patient Registry</span>
                    <span className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase">1.2k Total Entry</span>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-primary" />
              </Button>
            </Link>
            <Link href="/admin/appointments">
              <Button variant="ghost" className="w-full justify-between gap-4 h-20 rounded-[1.8rem] bg-white border-2 border-slate-50 hover:border-primary/20 hover:bg-primary/5 text-slate-900 font-black group transition-all duration-500 shadow-sm px-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm">Visit History</span>
                    <span className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase">Logs & Booking</span>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-primary" />
              </Button>
            </Link>
            <Link href="/admin/payments">
              <Button variant="ghost" className="w-full justify-between gap-4 h-20 rounded-[1.8rem] bg-white border-2 border-slate-50 hover:border-primary/20 hover:bg-primary/5 text-slate-900 font-black group transition-all duration-500 shadow-sm px-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all duration-500 flex items-center justify-center">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <span className="block text-sm">System Revenue</span>
                    <span className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase">Market Ledger</span>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-primary" />
              </Button>
            </Link>
          </div>
        </div>

        <Card className="lg:col-span-3 border border-slate-50 bg-white shadow-xl shadow-slate-200/50 rounded-[3rem] overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Global Visit <span className="text-primary italic">Logs</span></h2>
            <Button variant="ghost" className="text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/5 rounded-xl px-6">View Archive <ArrowUpRight className="ml-2 w-4 h-4" /></Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Patient Profile</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Expert</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Time / Window</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                  <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Entry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-20 text-center">
                      <div className="text-slate-400 font-bold text-sm uppercase tracking-widest italic opacity-50">Null Registry Data</div>
                    </td>
                  </tr>
                ) : (
                  recentAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-[1.2rem] bg-slate-900 flex items-center justify-center text-white font-black text-sm">
                            {appointment.patientName?.[0] || '?'}
                          </div>
                          <div>
                            <span className="block text-sm font-black text-slate-900 leading-none">{appointment.patientName || 'Unknown'}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1 block">Patient ID: {appointment.id.slice(-6).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-sm font-bold text-slate-700">
                        {appointment.doctorName || 'Unassigned'}
                      </td>
                      <td className="px-10 py-8">
                        <div className="space-y-1">
                          <span className="block text-sm font-black text-slate-900">{appointment.time}</span>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{appointment.date}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <Badge className={`px-4 py-1.5 text-[10px] uppercase font-black border-none rounded-full tracking-widest ${statusBadgeColor[appointment.status]}`}>
                          {appointment.status}
                        </Badge>
                      </td>
                      <td className="px-10 py-8 text-right">
                        {appointment.status !== 'cancelled' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-12 w-12 p-0 rounded-2xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-sm border border-primary/10"
                            onClick={() => {
                              setSelectedAptId(appointment.id);
                              setIsDialogOpen(true);
                            }}
                          >
                            <CreditCard className="w-5 h-5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
