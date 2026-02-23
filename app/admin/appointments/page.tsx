'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';

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

  const filteredAppointments =
    filterStatus === 'all'
      ? appointments
      : appointments.filter((apt) => apt.status === filterStatus);

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
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-foreground">Manage Appointments</h1>
            <p className="text-muted-foreground">Track and update all appointments</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <Card className="p-4 border-border mb-8">
          <div className="flex flex-wrap gap-2">
            {['all', 'scheduled', 'completed', 'cancelled'].map((status) => (
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
        </Card>

        {/* Appointments Table */}
        <Card className="border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Patient</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Doctor</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Specialty</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Time</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment._id} className="border-b border-border hover:bg-muted/50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {appointment.patientId ? `${appointment.patientId.firstName} ${appointment.patientId.lastName}` : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{appointment.doctorId?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm">
                        <Badge variant="secondary">{appointment.doctorId?.specialty || 'N/A'}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{appointment.date}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{appointment.time}</td>
                      <td className="px-6 py-4 text-sm">
                        <Badge className={statusBadgeColor[appointment.status]} variant="outline">
                          <span className="mr-1">{statusIcons[appointment.status]}</span>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          {appointment.status === 'scheduled' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(appointment._id, 'completed')}
                              >
                                Complete
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          {appointment.status !== 'scheduled' && (
                            <span className="text-xs text-muted-foreground">No actions</span>
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
    </div>
  );
}
