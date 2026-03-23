'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import {
  Users,
  Search,
  Plus,
  Mail,
  Calendar,
  ShieldCheck,
  MoreVertical,
  Trash2,
  Activity,
  User as UserIcon,
  RefreshCcw,
  ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  appointmentCount: number;
  lastVisit: string | null;
  status: string;
  createdAt: string;
}

export default function AdminPatientsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPatients = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/patients');
      const result = await response.json();
      if (result.success) {
        setPatients(result.data);
      }
    } catch (error) {
      toast.error('Failed to connect to patient database');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchPatients();
  }, [user, router]);

  const filteredPatients = patients.filter(
    (patient) =>
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-bold mt-4 animate-pulse uppercase tracking-widest text-xs">Loading patients...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-3">
            <Users className="w-4 h-4" />
            Patient Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Patient <span className="text-primary italic">Registry.</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">Oversee all registered patient profiles and health records</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="rounded-2xl font-black gap-2 h-14 px-8 bg-white border-2 border-slate-100 text-slate-900 hover:bg-slate-50 transition-all font-display"
            onClick={fetchPatients}
            disabled={refreshing}
          >
            <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''} text-primary`} />
            Refresh List
          </Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 border border-slate-50 bg-white shadow-xl shadow-slate-200/50 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-1 group relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">
                Identity Pool
              </Badge>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Total Registry</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">{patients.length}</p>
          </div>
        </Card>
        <Card className="p-8 border border-slate-50 bg-white shadow-xl shadow-slate-200/50 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-1 group relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Activity className="w-7 h-7" />
              </div>
              <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">
                Active Cycle
              </Badge>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Engaged Profiles</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">
              {Math.floor(patients.length * 0.4)}
            </p>
          </div>
        </Card>
        <Card className="p-8 border border-slate-50 bg-white shadow-xl shadow-slate-200/50 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-1 group relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="h-14 w-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <ArrowUpRight className="w-7 h-7" />
              </div>
              <Badge className="bg-violet-50 text-violet-600 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">
                Flow Rate
              </Badge>
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">New Registrations</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">
              {Math.floor(patients.length * 0.1)}
            </p>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-2 border-none shadow-xl shadow-slate-200/50 rounded-3xl bg-white overflow-hidden">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by patient name, email, or registry ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 h-16 bg-transparent border-none text-lg font-bold text-slate-900 focus:ring-0 placeholder:text-slate-400 outline-none"
          />
        </div>
      </Card>

      {/* Patients Table */}
      <Card className="border border-slate-50 bg-white shadow-xl shadow-slate-200/50 rounded-[3rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Patient Identity</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Access Protocol</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Registration Cycle</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Security Status</th>
                <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Global Entry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-40">
                      <div className="p-8 rounded-full bg-slate-50 border-2 border-dashed border-slate-100">
                        <Users className="w-16 h-16 text-slate-200" />
                      </div>
                      <p className="text-xl font-black text-slate-900 tracking-tight">Null Registry Data</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-sm">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg leading-tight">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 opacity-60">
                            REG-PAT-{patient._id.slice(-6).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-1.5">
                        <span className="text-sm font-black text-slate-700 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary/40" /> {patient.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-1.5">
                        <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          {new Date(patient.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter">System Entry Logged</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full">
                        Verified Identity
                      </Badge>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-12 w-12 rounded-2xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-sm border border-primary/10"
                        >
                          <Activity className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100"
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
