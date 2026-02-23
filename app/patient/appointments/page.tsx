'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard-shell';
import { Card } from '@/components/ui/card';
import { AppointmentCard } from '@/components/appointment-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { Calendar, Search, Filter, ArrowLeft, ArrowRight, RefreshCcw } from 'lucide-react';

interface Appointment {
  _id: string;
  doctorId: {
    name: string;
    specialty: string;
    location: string;
  };
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export default function PatientAppointments() {
  const router = useRouter();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'patient') {
      router.push('/login');
      return;
    }
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`/api/appointments/patient?patientId=${user.id}`);
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

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = !searchTerm ||
      apt.doctorId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctorId.specialty.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleCancelAppointment = async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setAppointments(prev =>
          prev.map(apt =>
            apt._id === id ? { ...apt, status: 'cancelled' } : apt
          )
        );
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
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
          <h1 className="text-3xl font-bold text-foreground">My Appointments</h1>
          <p className="text-muted-foreground">Manage your scheduled appointments</p>
        </div>
        <Button onClick={() => router.push('/patient/book-appointment')}>
          <Calendar className="w-4 h-4 mr-2" />
          Book New
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground">{appointments.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
              <p className="text-2xl font-bold text-blue-600">
                {appointments.filter(a => a.status === 'scheduled').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {appointments.filter(a => a.status === 'completed').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
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
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex gap-2">
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
        </div>
      </Card>

      {/* Appointments List */}
      <Card className="border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">Specialty</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No appointments found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {appointment.doctorId.name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Badge variant="secondary">{appointment.doctorId.specialty}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{appointment.date}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{appointment.time}</td>
                    <td className="px-6 py-4 text-sm">
                      <Badge variant="outline">
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {appointment.status === 'scheduled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/patient/book-appointment')}
                          >
                            Reschedule
                          </Button>
                        )}
                        {appointment.status === 'scheduled' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelAppointment(appointment._id)}
                          >
                            Cancel
                          </Button>
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
  );
}
