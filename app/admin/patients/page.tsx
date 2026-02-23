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
  ArrowLeft,
  Search,
  Mail,
  Phone,
  User as UserIcon,
  Calendar,
  Clock,
  ChevronRight,
  Activity,
  ShieldCheck,
  Filter,
  RefreshCcw,
  MoreVertical
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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest mb-1">
              <ShieldCheck className="w-3 h-3" />
              Secure Patient Records
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tight">Patient <span className="text-primary italic">Directory</span></h1>
            <p className="text-muted-foreground font-medium">Manage and monitor community health profiles</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl font-bold h-12 px-6 gap-2 bg-white"
            onClick={fetchPatients}
            disabled={refreshing}
          >
            <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Sync DB
          </Button>
          <Button className="rounded-xl font-black h-12 px-8 shadow-xl shadow-primary/20">
            Export Data
          </Button>
        </div>
      </div>

      {/* Global Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Card className="flex-grow p-2 border-none shadow-sm bg-white/80 backdrop-blur-md rounded-2xl flex items-center">
          <Search className="w-5 h-5 ml-4 text-primary opacity-50" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-none text-lg font-bold bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/40 h-12"
          />
        </Card>
        <Button variant="outline" className="h-16 w-16 rounded-2xl bg-white border-none shadow-sm text-muted-foreground">
          <Filter className="w-6 h-6" />
        </Button>
      </div>

      {/* Patient Analytics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 border-none shadow-sm bg-black text-white rounded-3xl">
          <p className="text-[10px] uppercase font-black text-primary tracking-widest mb-1">Total Patients</p>
          <p className="text-3xl font-black">{patients.length}</p>
        </Card>
        <Card className="p-6 border-none shadow-sm bg-white rounded-3xl border-l-4 border-l-blue-500">
          <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">Active Patients</p>
          <p className="text-3xl font-black text-foreground">{patients.filter(p => (p.appointmentCount || 0) > 0).length}</p>
        </Card>
        <Card className="p-6 border-none shadow-sm bg-white rounded-3xl border-l-4 border-l-emerald-500">
          <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">New Registrations</p>
          <p className="text-3xl font-black text-foreground">
            {patients.filter(p => new Date(p.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
          </p>
        </Card>
        <Card className="p-6 border-none shadow-sm bg-white rounded-3xl border-l-4 border-l-violet-500">
          <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">System Uptime</p>
          <p className="text-3xl font-black text-foreground">99.8%</p>
        </Card>
      </div>

      {/* Patients Table/List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPatients.length === 0 ? (
          <Card className="p-20 border-dashed border-2 bg-transparent text-center rounded-[3rem]">
            <div className="bg-muted p-8 rounded-full w-fit mx-auto mb-6 opacity-20">
              <UserIcon className="w-16 h-16" />
            </div>
            <h3 className="text-2xl font-black text-foreground">No Patients Found</h3>
            <p className="text-muted-foreground">Matching patient information could not be retrieved.</p>
          </Card>
        ) : (
          filteredPatients.map((patient) => (
            <Card key={patient._id} className="p-4 border-none shadow-sm hover:shadow-xl transition-all duration-300 group bg-white rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer">
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center font-black text-primary text-xl relative group-hover:scale-110 transition-transform">
                  {patient.firstName[0]}{patient.lastName[0]}
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                    {patient.firstName} {patient.lastName}
                    <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-tighter h-5">Patient</Badge>
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {patient.email}</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/30"></span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Member since {new Date(patient.createdAt).getFullYear()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-8 md:gap-12 px-6 border-l border-muted/50">
                <div className="text-center md:text-left">
                  <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">Visits</p>
                  <p className="text-lg font-black text-foreground">{patient.appointmentCount || 0}</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">Last Visit</p>
                  <p className="text-lg font-black text-foreground">
                    {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'None'}
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-1">Vitals</p>
                  <div className="flex items-center gap-1">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    <p className="text-lg font-black text-emerald-600">Stable</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-xl h-12 w-12 hover:bg-muted">
                  <MoreVertical className="w-5 h-5 text-muted-foreground" />
                </Button>
                <Button className="rounded-xl font-black h-12 px-6 group">
                  View Records <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
