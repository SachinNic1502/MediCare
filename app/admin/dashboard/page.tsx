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
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-1">
            <Activity className="w-4 h-4" />
            System Stats
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">
            Admin <span className="text-primary italic">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">Overview of hospital operations & appointments</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl font-bold h-12 px-6 shadow-xl shadow-primary/20 bg-primary text-white hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem] border-none shadow-2xl max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Record <span className="text-primary italic">Payment</span></DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Appointment</Label>
                  <Select value={selectedAptId} onValueChange={(val) => {
                    setSelectedAptId(val);
                    const apt = availableApts.find(a => a._id === val);
                    if (apt) setAmount((apt.consultationFee || apt.doctorId?.consultationFee || '').toString());
                  }}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-200">
                      <SelectValue placeholder="Choose appointment..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl">
                      {availableApts.map(a => (
                        <SelectItem key={a._id} value={a._id} className="rounded-lg">
                          {a.patientId?.firstName} vs {a.doctorId?.name} ({new Date(a.date).toLocaleDateString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount ($)</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Method</Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl">
                      <SelectItem value="cash" className="rounded-lg">Cash</SelectItem>
                      <SelectItem value="credit_card" className="rounded-lg">Credit Card</SelectItem>
                      <SelectItem value="bank_transfer" className="rounded-lg">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                  onClick={handleRecordPayment}
                  disabled={creating}
                >
                  {creating ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                  Confirm Entry
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            className="rounded-xl font-bold gap-2 h-12 px-6 bg-white"
            onClick={fetchData}
            disabled={refreshing}
          >
            <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6 border-none shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full ${stat.bg} blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-background/50 border-border/50">
                    {stat.trend}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-black text-foreground mt-1">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border-none shadow-sm h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-foreground">Appointment Velocity</h3>
              <p className="text-sm text-muted-foreground font-medium">Volume of patient bookings (7-day trend)</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-muted p-1 rounded-lg">
              <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold px-3">DAY</Button>
              <Button variant="secondary" size="sm" className="h-7 text-[10px] font-bold px-3 shadow-none">WEEK</Button>
              <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold px-3">MONTH</Button>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.9 0 0 / 0.1)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 700 }}
                />
                <Area
                  type="monotone"
                  dataKey="appointments"
                  stroke="var(--primary)"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorTrend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-sm h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-foreground">Revenue Flow</h3>
              <p className="text-sm text-muted-foreground font-medium">Earnings by day</p>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.9 0 0 / 0.1)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip
                  cursor={{ fill: 'var(--primary)', opacity: 0.05 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Management & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

        <div className="space-y-6">
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-3">
            <Link href="/admin/doctors">
              <Button variant="ghost" className="w-full justify-between gap-3 h-14 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-primary/5 text-foreground font-black group transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-border/50 px-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <span>Doctor Directory</span>
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" />
              </Button>
            </Link>
            <Link href="/admin/patients">
              <Button variant="ghost" className="w-full justify-between gap-3 h-14 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-primary/5 text-foreground font-black group transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-border/50 px-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                    <Users className="w-5 h-5" />
                  </div>
                  <span>Patient Directory</span>
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" />
              </Button>
            </Link>
            <Link href="/admin/appointments">
              <Button variant="ghost" className="w-full justify-between gap-3 h-14 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-primary/5 text-foreground font-black group transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-border/50 px-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span>Appointments</span>
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" />
              </Button>
            </Link>
            <Link href="/admin/payments">
              <Button variant="ghost" className="w-full justify-between gap-3 h-14 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-primary/5 text-foreground font-black group transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-border/50 px-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span>Revenue Management</span>
                </div>
                <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary" />
              </Button>
            </Link>
          </div>
        </div>

        <Card className="lg:col-span-3 p-0 border-none shadow-sm overflow-hidden">
          <div className="p-6 border-b border-muted flex items-center justify-between bg-white/50">
            <h2 className="text-xl font-black text-foreground">Recent Appointments</h2>
            <Button variant="link" className="text-primary font-bold">View all <ArrowUpRight className="w-4 h-4" /></Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30">
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Patient</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Doctor</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Timing</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Status</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/50">
                {recentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="text-muted-foreground font-medium">No recent appointments found.</div>
                    </td>
                  </tr>
                ) : (
                  recentAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary font-black text-xs">
                            {appointment.patientName?.[0] || '?'}
                          </div>
                          <span className="text-sm font-bold text-foreground">{appointment.patientName || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">{appointment.doctorName || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-primary" /> {appointment.time}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter italic opacity-60">
                            {appointment.date}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <Badge className={`px-3 py-1 text-[10px] uppercase font-black border tracking-tighter ${statusBadgeColor[appointment.status]}`}>
                          {appointment.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {appointment.status !== 'cancelled' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg hover:bg-emerald-50 text-emerald-600"
                            onClick={() => {
                              setSelectedAptId(appointment.id);
                              // We don't have consultation fee in the recentAppointments list from /api/admin/stats
                              // but we can open the dialog and let them fill it or ideally we'd fetch it.
                              setIsDialogOpen(true);
                            }}
                          >
                            <CreditCard className="w-4 h-4" />
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
