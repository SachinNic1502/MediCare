'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    CreditCard,
    CheckCircle,
    Clock,
    AlertCircle,
    Search,
    Download,
    RefreshCcw,
    ArrowLeft,
    Filter,
    Users,
    Plus
} from 'lucide-react';

interface Payment {
    _id: string;
    appointmentId: {
        _id: string;
        patientId?: {
            firstName: string;
            lastName: string;
            email: string;
        };
        doctorId: {
            name: string;
            specialty: string;
        };
        date: string;
        time: string;
    };
    amount: number;
    status: 'pending' | 'paid' | 'refunded' | 'failed';
    paymentMethod: string;
    transactionId: string;
    createdAt: string;
    paidAt?: string;
}

export default function AdminPayments() {
    const router = useRouter();
    const { user } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // New payment state
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [selectedAppointment, setSelectedAppointment] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
    const [creating, setCreating] = useState(false);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/payments');
            const data = await response.json();
            if (data.success) {
                setPayments(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch payments:', error);
            toast.error('Failed to load payment history');
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await fetch('/api/appointments?limit=50&status=scheduled');
            const data = await response.json();
            if (data.success) {
                setAppointments(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            router.push('/login');
            return;
        }
        fetchPayments();
        fetchAppointments();
    }, [user, router]);

    const handleCreatePayment = async () => {
        if (!selectedAppointment || !amount) {
            toast.error('Please select an appointment and enter an amount');
            return;
        }

        try {
            setCreating(true);
            const response = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appointmentId: selectedAppointment,
                    amount: parseFloat(amount),
                    paymentMethod,
                    status: (paymentMethod === 'cash' || paymentMethod === 'bank_transfer') ? 'paid' : 'pending'
                }),
            });

            const result = await response.json();
            if (result.success) {
                toast.success('Payment record created');
                setIsCreateDialogOpen(false);
                fetchPayments();
                // Reset form
                setSelectedAppointment('');
                setAmount('');
            } else {
                toast.error(result.error || 'Failed to create payment');
            }
        } catch (error) {
            console.error('Error creating payment:', error);
            toast.error('Network error occurred');
        } finally {
            setCreating(false);
        }
    };

    const stats = {
        totalRevenue: payments
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + p.amount, 0),
        pendingAmount: payments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + p.amount, 0),
        totalCount: payments.length,
        paidCount: payments.filter(p => p.status === 'paid').length,
    };

    const filteredPayments = payments.filter((payment) => {
        const patientName = `${payment?.appointmentId?.patientId?.firstName || ''} ${payment?.appointmentId?.patientId?.lastName || ''}`.toLowerCase();
        const doctorName = payment?.appointmentId?.doctorId?.name?.toLowerCase() || '';
        const txnId = payment?.transactionId?.toLowerCase() || '';

        const matchesSearch = !searchTerm ||
            patientName.includes(searchTerm.toLowerCase()) ||
            doctorName.includes(searchTerm.toLowerCase()) ||
            txnId.includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Paid</Badge>;
            case 'pending':
                return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>;
            case 'refunded':
                return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Refunded</Badge>;
            case 'failed':
                return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20">Failed</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <RefreshCcw className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
    <div className="space-y-10 pb-12 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-3">
            <CreditCard className="w-4 h-4" />
            Financial Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Financial <span className="text-primary italic">Registry.</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">Monitor and audit all hospital transactions and billing logs</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="rounded-2xl font-black gap-2 h-14 px-8 bg-white border-2 border-slate-100 text-slate-900 hover:bg-slate-50 transition-all font-display"
            onClick={fetchPayments}
          >
            <RefreshCcw className="w-4 h-4 text-primary" />
            Refresh Data
          </Button>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-2xl font-black h-14 px-8 shadow-xl shadow-primary/20 bg-primary text-white hover:bg-primary/90 transition-all active:scale-95">
                <Plus className="w-5 h-5 mr-1" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl rounded-[3.5rem] border-none shadow-2xl p-1 bg-white overflow-hidden">
              <div className="bg-slate-50/50 p-10 flex items-center justify-between shrink-0 border-b border-slate-100 rounded-t-[3.4rem]">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Record Entry.</h2>
                  <p className="text-slate-500 font-medium text-sm mt-1 font-display">Log a new clinical transaction into the registry</p>
                </div>
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-white shadow-xl hover:bg-slate-900 hover:text-white transition-all" onClick={() => setIsCreateDialogOpen(false)}>
                  <Plus className="w-5 h-5 rotate-45" />
                </Button>
              </div>
              <div className="p-10 space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Assigned Case / Visit</Label>
                  <Select
                    onValueChange={(value) => {
                      setSelectedAppointment(value);
                      const apt = appointments.find(a => a._id === value);
                      if (apt && apt.consultationFee) {
                        setAmount(apt.consultationFee.toString());
                      } else if (apt && apt.doctorId?.consultationFee) {
                        setAmount(apt.doctorId.consultationFee.toString());
                      }
                    }}
                    value={selectedAppointment}
                  >
                    <SelectTrigger className="h-14 rounded-2xl font-black border-2 border-slate-50 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-lg pl-6">
                      <SelectValue placeholder="Pick an active case..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white/95 backdrop-blur-xl">
                      {appointments.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-400 font-bold uppercase tracking-widest">No Active Cases Found</div>
                      ) : (
                        appointments.map((apt) => (
                          <SelectItem key={apt._id} value={apt._id} className="rounded-xl font-bold py-3 px-4 hover:bg-slate-50 text-slate-700">
                            {apt.patientId?.firstName} {apt.patientId?.lastName} - {apt.doctorId?.name}
                          </SelectItem>
                        ))
                      )}
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
                  <Select onValueChange={setPaymentMethod} value={paymentMethod}>
                    <SelectTrigger className="h-14 rounded-2xl font-black border-2 border-slate-50 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-lg pl-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2 bg-white/95 backdrop-blur-xl">
                      <SelectItem value="credit_card" className="rounded-xl font-bold py-3 px-4 hover:bg-slate-50">Credit / Debit Instrument</SelectItem>
                      <SelectItem value="bank_transfer" className="rounded-xl font-bold py-3 px-4 hover:bg-slate-50">Direct Bank Transfer</SelectItem>
                      <SelectItem value="cash" className="rounded-xl font-bold py-3 px-4 hover:bg-slate-50">Cash Settlement</SelectItem>
                      <SelectItem value="insurance" className="rounded-xl font-bold py-3 px-4 hover:bg-slate-50">Insurance Coverage Claim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="p-10 pt-0 bg-white">
                <Button
                  className="w-full h-20 rounded-[1.8rem] font-black uppercase tracking-widest shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white transition-all active:scale-95 leading-none"
                  onClick={handleCreatePayment}
                  disabled={creating}
                >
                  {creating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : 'Finalize Payment Entry'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="rounded-2xl font-black gap-2 h-14 px-8 bg-white border-2 border-slate-100 text-slate-900 hover:bg-slate-50 transition-all font-display">
            <Download className="w-5 h-5 text-slate-400" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: '+12.5% vs Previous' },
          { label: 'Pending Dues', value: `$${stats.pendingAmount.toLocaleString()}`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Awaiting Settlement' },
          { label: 'Global Orders', value: stats.totalCount, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'Life-time Log entries' },
          { label: 'Collection Rate', value: `${((stats.paidCount / (stats.totalCount || 1)) * 100).toFixed(1)}%`, icon: CheckCircle, color: 'text-violet-600', bg: 'bg-violet-50', sub: 'Audit Efficiency' },
        ].map((stat) => (
          <Card key={stat.label} className="p-8 border border-slate-50 bg-white shadow-xl shadow-slate-200/50 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-1 group relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className={`h-14 w-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <Badge className={`${stat.bg} ${stat.color} border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg`}>
                  Real-time
                </Badge>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{stat.value}</p>
              <p className={`text-[10px] ${stat.color} font-black uppercase tracking-tighter`}>{stat.sub}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Table Card */}
      <Card className="border border-slate-50 bg-white shadow-xl shadow-slate-200/50 rounded-[3rem] overflow-hidden">
        <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="relative group flex-1 max-w-xl">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by Patient, Doctor, or Transaction ID..."
              className="w-full pl-16 pr-8 h-16 bg-white border-none rounded-3xl text-lg font-bold text-slate-900 shadow-sm focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-slate-400 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100 flex-wrap">
            {['all', 'paid', 'pending', 'refunded'].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'ghost'}
                size="sm"
                className={`h-12 px-6 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${filterStatus === status ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                onClick={() => setFilterStatus(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 font-display">Patient Identity</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 font-display">Provider / Unit</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 font-display">Fee Amount</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 font-display">Cycle Date</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 font-display text-center">Audit Status</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 font-display">Registry UID</th>
                <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 font-display">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-10 py-32 text-center text-slate-400 font-black uppercase tracking-widest opacity-40">
                    Null Settlement Registry Found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-sm">
                          {payment?.appointmentId?.patientId?.firstName?.[0] || 'P'}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg leading-tight">
                            {payment?.appointmentId?.patientId
                              ? `${payment.appointmentId.patientId.firstName} ${payment.appointmentId.patientId.lastName}`
                              : 'Unknown Patient'
                            }
                          </p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1.5 opacity-60 italic">{payment?.appointmentId?.patientId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div>
                        <p className="text-sm font-black text-slate-900">{payment?.appointmentId?.doctorId?.name}</p>
                        <p className="text-[10px] text-primary uppercase font-black tracking-tighter mt-1">{payment?.appointmentId?.doctorId?.specialty}</p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <p className="text-2xl font-black text-slate-900 tracking-tighter">${payment.amount.toLocaleString()}</p>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900">
                          {new Date(payment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Settlement Logged</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <Badge className={`
                        px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-none
                        ${payment.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 
                          payment.status === 'pending' ? 'bg-amber-50 text-amber-600' : 
                          payment.status === 'refunded' ? 'bg-blue-50 text-blue-600' : 
                          'bg-rose-50 text-rose-600'}
                      `}>
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="px-10 py-8">
                      <code className="text-[10px] font-black bg-slate-50 px-3 py-2 rounded-xl text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 border border-slate-100">
                        TXN-{payment.transactionId.toUpperCase()}
                      </code>
                    </td>
                    <td className="px-10 py-8 text-right">
                      {payment.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all px-6"
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/payments/${payment._id}`, { method: 'POST' });
                              if (res.ok) {
                                toast.success('Transaction marked as PAID');
                                fetchPayments();
                              } else {
                                toast.error('Failed to update status');
                              }
                            } catch (err) {
                              toast.error('Network error');
                            }
                          }}
                        >
                          Mark Paid
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
  );
}
