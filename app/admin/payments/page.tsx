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
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-2 text-sm font-bold uppercase tracking-wider"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-4xl font-black text-foreground tracking-tight">
                        Revenue <span className="text-primary italic">Management</span>
                    </h1>
                    <p className="text-muted-foreground font-medium">Monitor and audit all hospital transactions</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl font-bold h-12 px-6" onClick={fetchPayments}>
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>

                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-xl font-bold h-12 px-6 shadow-xl shadow-primary/20 bg-primary text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Payment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black text-foreground">Record New <span className="text-primary italic text-xl opacity-80">Payment</span></DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Select Appointment</Label>
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
                                        <SelectTrigger className="rounded-xl border-slate-200 h-12 font-medium">
                                            <SelectValue placeholder="Pick an appointment..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-none shadow-xl">
                                            {appointments.length === 0 ? (
                                                <div className="p-4 text-center text-sm text-muted-foreground">No recent appointments found</div>
                                            ) : (
                                                appointments.map((apt) => (
                                                    <SelectItem key={apt._id} value={apt._id} className="rounded-lg font-medium">
                                                        {apt.patientId?.firstName} {apt.patientId?.lastName} - {apt.doctorId?.name} ({new Date(apt.date).toLocaleDateString()})
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Payment Amount ($)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        className="rounded-xl border-slate-200 h-12 font-bold text-lg"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Method</Label>
                                    <Select onValueChange={setPaymentMethod} value={paymentMethod}>
                                        <SelectTrigger className="rounded-xl border-slate-200 h-12 font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-none shadow-xl">
                                            <SelectItem value="credit_card" className="rounded-lg font-medium">Credit/Debit Card</SelectItem>
                                            <SelectItem value="bank_transfer" className="rounded-lg font-medium">Bank Transfer</SelectItem>
                                            <SelectItem value="cash" className="rounded-lg font-medium">Cash Payment</SelectItem>
                                            <SelectItem value="insurance" className="rounded-lg font-medium">Insurance Claim</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    className="w-full rounded-xl h-12 font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                                    onClick={handleCreatePayment}
                                    disabled={creating}
                                >
                                    {creating ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                                    Confirm Payment Entry
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button className="rounded-xl font-bold h-12 px-6 shadow-xl shadow-primary/10 variant-outline" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6 border-none shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                            <CreditCard className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-foreground">${stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1">+12.5% from last month</p>
                </Card>

                <Card className="p-6 border-none shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Receivables</p>
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-foreground">${stats.pendingAmount.toLocaleString()}</p>
                    <p className="text-[10px] text-amber-600 font-bold mt-1">Pending transactions</p>
                </Card>

                <Card className="p-6 border-none shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Orders</p>
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-foreground">{stats.totalCount}</p>
                    <p className="text-[10px] text-blue-600 font-bold mt-1">Life-time entries</p>
                </Card>

                <Card className="p-6 border-none shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Fulfillment</p>
                        <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600">
                            <CheckCircle className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-foreground">{((stats.paidCount / (stats.totalCount || 1)) * 100).toFixed(1)}%</p>
                    <p className="text-[10px] text-violet-600 font-bold mt-1">Completion rate</p>
                </Card>
            </div>

            {/* Main Table Card */}
            <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                <div className="p-6 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by Patient, Doctor, or Transaction ID..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border/50 bg-background focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground mr-1" />
                        {['all', 'paid', 'pending', 'refunded'].map((status) => (
                            <Button
                                key={status}
                                variant={filterStatus === status ? 'default' : 'ghost'}
                                size="sm"
                                className={`text-xs font-bold rounded-lg ${filterStatus === status ? 'bg-primary text-white' : 'text-muted-foreground hover:text-primary'}`}
                                onClick={() => setFilterStatus(status)}
                            >
                                {status.toUpperCase()}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border/50">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Patient</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Provider/Clinic</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Identifier</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground font-medium italic">
                                        No transactions found matching the current criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-primary/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold text-xs">
                                                    {payment?.appointmentId?.patientId?.firstName?.[0] || 'P'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">
                                                        {payment?.appointmentId?.patientId
                                                            ? `${payment.appointmentId.patientId.firstName} ${payment.appointmentId.patientId.lastName}`
                                                            : 'Unknown Patient'
                                                        }
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground font-medium">{payment?.appointmentId?.patientId?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{payment?.appointmentId?.doctorId?.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter italic">{payment?.appointmentId?.doctorId?.specialty}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-black text-foreground">${payment.amount.toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                                            {new Date(payment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(payment.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-[10px] font-bold bg-muted p-1.5 rounded-lg text-muted-foreground group-hover:text-primary transition-colors">
                                                {payment.transactionId}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {payment.status === 'pending' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-[10px] font-black uppercase h-8 px-3 rounded-lg border-emerald-500/50 text-emerald-600 hover:bg-emerald-50"
                                                    disabled={loading}
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
