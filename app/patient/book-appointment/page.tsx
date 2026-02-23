'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, Clock } from 'lucide-react';

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  location: string;
  availability: string;
  availableSlots: string[];
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'patient') {
      router.push('/login');
      return;
    }

    fetchDoctors();
  }, [router]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors');
      const result = await response.json();

      if (result.success) {
        setDoctors(result.data);
      } else {
        setError('Failed to load doctors');
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setError('Please select a doctor, date, and time');
      return;
    }

    setBooking(true);
    setError('');

    try {
      const appointmentData = {
        patientId: user?.id,
        doctorId: selectedDoctor,
        date: selectedDate,
        time: selectedTime,
        reason: 'General consultation', // You can add a reason field to the form
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      const result = await response.json();

      if (result.success) {
        router.push('/patient/dashboard?appointment=success');
      } else {
        setError(result.error || 'Failed to book appointment');
      }
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError('Failed to book appointment. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  const selectedDoctorData = doctors.find((d) => d._id === selectedDoctor);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading doctors...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/patient/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-foreground">Book an Appointment</h1>
            <p className="text-muted-foreground">
              Select a doctor and choose your preferred date and time
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctor Selection */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-foreground mb-6">Select a Doctor</h2>
            <div className="space-y-4">
              {doctors.map((doctor) => (
                <Card
                  key={doctor._id}
                  className={`p-6 border-2 cursor-pointer transition ${selectedDoctor === doctor._id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                    }`}
                  onClick={() => setSelectedDoctor(doctor._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {doctor.name}
                      </h3>
                      <p className="text-sm text-primary font-medium mb-2">
                        {doctor.specialty}
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Experience: {doctor.experience} years
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        📍 {doctor.location}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium text-foreground">{doctor.rating}</span>
                      </div>
                    </div>
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${selectedDoctor === doctor._id
                          ? 'border-primary bg-primary'
                          : 'border-border'
                        }`}
                    >
                      {selectedDoctor === doctor._id && (
                        <span className="text-primary-foreground font-bold">✓</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <Card className="p-6 border-border sticky top-20">
              <h3 className="text-lg font-semibold text-foreground mb-6">Booking Details</h3>

              {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                {/* Doctor Summary */}
                {selectedDoctorData && (
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-1">Selected Doctor</p>
                    <p className="font-semibold text-foreground">
                      {selectedDoctorData.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedDoctorData.specialty} • {selectedDoctorData.location}
                    </p>
                  </div>
                )}

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground"
                  />
                </div>

                {/* Time Selection */}
                {selectedDoctor && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Select Time
                    </label>
                    <div className="space-y-2">
                      {selectedDoctorData?.availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`w-full p-3 rounded-lg border-2 font-medium transition flex items-center justify-center gap-2 ${selectedTime === slot
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background text-foreground hover:border-primary/50'
                            }`}
                        >
                          <Clock className="w-4 h-4" />
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {selectedDoctor && selectedDate && selectedTime && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-xs text-muted-foreground mb-2">Appointment Summary</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-foreground">
                        <span className="font-medium">Doctor:</span> {selectedDoctorData?.name}
                      </p>
                      <p className="text-foreground">
                        <span className="font-medium">Specialty:</span> {selectedDoctorData?.specialty}
                      </p>
                      <p className="text-foreground">
                        <span className="font-medium">Location:</span> {selectedDoctorData?.location}
                      </p>
                      <p className="text-foreground">
                        <span className="font-medium">Date:</span> {new Date(selectedDate).toLocaleDateString()}
                      </p>
                      <p className="text-foreground">
                        <span className="font-medium">Time:</span> {selectedTime}
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleBooking}
                  disabled={!selectedDoctor || !selectedDate || !selectedTime || booking}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {booking ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

