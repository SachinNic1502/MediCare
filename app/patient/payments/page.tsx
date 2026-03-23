'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { CreditCard, Calendar, CheckCircle, Clock, AlertCircle, Search, Filter, Download, ExternalLink, RefreshCcw } from 'lucide-react';

interface Payment {
  _id: string;
  appointmentId: {
    _id: string;
    doctorName: string;
    specialty: string;
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

export default function PatientPayments() {
  const router = useRouter();
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'patient') {
      router.push('/login');
      return;
    }

    const fetchPayments = async () => {
      try {
        const response = await fetch(`/api/payments?patientId=${user.id}`);
        const data = await response.json();
        if (data.success) {
          setPayments(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user, router]);

  const handlePayNow = async (paymentId: string) => {
    try {
      // In a real app, this would integrate with a payment processor
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (result.success) {
        // Redirect to payment processor
        window.location.href = result.paymentUrl;
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const handleDownloadReceipt = (paymentId: string) => {
    // Generate and download receipt
    const receiptData = payments.find(p => p._id === paymentId);
    if (receiptData) {
      const receiptContent = `
Payment Receipt
================
Transaction ID: ${receiptData.transactionId}
Date: ${new Date(receiptData.createdAt).toLocaleDateString()}
Amount: $${receiptData.amount}
Status: ${receiptData.status}
Payment Method: ${receiptData.paymentMethod}

Doctor: ${receiptData?.appointmentId?.doctorName || 'Unknown'}
Specialty: ${receiptData?.appointmentId?.specialty || 'N/A'}
Appointment: ${receiptData?.appointmentId?.date ? new Date(receiptData.appointmentId.date).toLocaleDateString() : 'N/A'} at ${receiptData?.appointmentId?.time || 'N/A'}
      `;

      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${receiptData.transactionId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = !searchTerm ||
      payment?.appointmentId?.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment?.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: payments.length,
    paid: payments.filter(p => p.status === 'paid').length,
    pending: payments.filter(p => p.status === 'pending').length,
    refunded: payments.filter(p => p.status === 'refunded').length,
    totalSpent: payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0),
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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-1">
            <CreditCard className="w-4 h-4" />
            Financial Records
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">
            Payment <span className="text-primary italic">History</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">Track all your medical expense transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl font-bold gap-2 h-12 px-6 bg-white border-slate-200">
            <RefreshCcw className="w-4 h-4" />
            Sync
          </Button>
        </div>
      </div>

      {/* Financial Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 border-none shadow-sm bg-white rounded-2xl group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Spent</p>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600">${stats.totalSpent.toFixed(2)}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-1">Lifetime</p>
        </Card>

        <Card className="p-6 border-none shadow-sm bg-white rounded-2xl group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Paid</p>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">{stats.paid}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-1">Transactions</p>
        </Card>

        <Card className="p-6 border-none shadow-sm bg-white rounded-2xl group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pending</p>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">{stats.pending}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-1">Awaiting</p>
        </Card>

        <Card className="p-6 border-none shadow-sm bg-white rounded-2xl group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Refunded</p>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-foreground">{stats.refunded}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-1">Processed</p>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 border-none shadow-sm bg-white rounded-2xl">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by doctor, transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {['all', 'paid', 'pending', 'refunded'].map((status) => (
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

      {/* Transactions Table */}
      <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Medical Provider</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Amount</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <CreditCard className="w-16 h-16" />
                      <p className="text-xl font-black">No payment records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          {new Date(payment.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">
                          #{payment.transactionId.slice(-6).toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold">
                          {payment?.appointmentId?.doctorName?.[0] || 'D'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{payment?.appointmentId?.doctorName || 'Unknown'}</p>
                          <p className="text-[10px] font-black text-primary uppercase tracking-tighter">{payment?.appointmentId?.specialty || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="inline-flex flex-col items-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        <span className="text-lg font-black text-slate-900">${payment.amount.toFixed(2)}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{payment.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <Badge className={`
                        px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border-none
                        ${payment.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600' : 
                          payment.status === 'pending' ? 'bg-amber-500/10 text-amber-600' : 
                          'bg-blue-500/10 text-blue-600'}
                      `}>
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {payment.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePayNow(payment._id)}
                            className="h-9 rounded-xl font-bold border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                          >
                            Pay Now
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadReceipt(payment._id)}
                          className="h-9 w-9 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5"
                        >
                          <Download className="w-4 h-4" />
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

      {/* Empty State */}
      {filteredPayments.length === 0 && (
        <Card className="p-20 text-center border-none shadow-sm bg-white rounded-[2rem]">
          <div className="bg-slate-100 p-10 rounded-full w-fit mx-auto mb-8">
            <CreditCard className="w-20 h-20 text-slate-300" />
          </div>
          <h3 className="text-3xl font-black text-foreground mb-4 tracking-tight">No Payment <span className="text-primary italic">History</span></h3>
          <p className="text-lg text-slate-600 max-w-sm mx-auto mb-10 font-medium">
            Your payment transactions will appear here once you complete appointments.
          </p>
          <Button 
            onClick={() => router.push('/patient/book-appointment')}
            className="rounded-2xl font-bold h-14 px-12 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white text-lg"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Book Appointment
          </Button>
        </Card>
      )}
    </div>
  );
}
