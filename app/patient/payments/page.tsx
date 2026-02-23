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
      const response = await fetch(`/api/payments/${paymentId}/pay`, {
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payment History</h1>
          <p className="text-muted-foreground">View and manage your payment transactions</p>
        </div>
        <Button>
          <CreditCard className="w-4 h-4 mr-2" />
          Make Payment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold text-emerald-600">${stats.totalSpent.toFixed(2)}</p>
            </div>
            <CreditCard className="h-8 w-8 text-emerald-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Paid</p>
              <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Refunded</p>
              <p className="text-2xl font-bold text-blue-600">{stats.refunded}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {['all', 'paid', 'pending', 'refunded'].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Payments Table */}
      <Card className="border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No payments found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <div className="font-medium text-foreground">{payment?.appointmentId?.doctorName || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">{payment?.appointmentId?.specialty || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">
                          {payment?.appointmentId?.date ? new Date(payment.appointmentId.date).toLocaleDateString() : 'N/A'} at {payment?.appointmentId?.time || ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {payment.paymentMethod}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Badge variant="outline">
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {payment.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePayNow(payment._id)}
                          >
                            Pay Now
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadReceipt(payment._id)}
                        >
                          <Download className="h-4 w-4" />
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

      {filteredPayments.length === 0 && (
        <Card className="p-12 text-center">
          <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No payments found</h3>
          <p className="text-muted-foreground mb-4">Your payment history will appear here once you make appointments.</p>
          <Button onClick={() => router.push('/patient/book-appointment')}>
            <Calendar className="w-4 h-4 mr-2" />
            Book Appointment
          </Button>
        </Card>
      )}
    </div>
  );
}
