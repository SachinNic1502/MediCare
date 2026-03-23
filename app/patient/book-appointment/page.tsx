'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { 
  ArrowLeft, 
  ArrowRight,
  Clock, 
  Calendar, 
  MapPin, 
  Star, 
  CheckCircle,
  Activity,
  Users,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  location: string;
  availability: string;
  availableSlots: string[];
  consultationFee: number;
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
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div className="flex items-center gap-8">
            <Link href="/patient/dashboard">
              <Button variant="outline" className="rounded-2xl h-14 w-14 border-2 border-slate-200 hover:bg-slate-50 text-slate-900 transition-all">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
                <Calendar className="w-4 h-4" />
                Book a Visit
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Schedule a <span className="text-primary italic">Doctor</span>
              </h1>
              <p className="text-slate-500 mt-2 font-medium text-lg">Choose from our verified medical experts</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="rounded-2xl font-bold gap-2 h-14 px-8 bg-white border-2 border-slate-100 text-slate-900 hover:bg-slate-50">
              <Filter className="w-5 h-5 text-slate-400" />
              Filter
            </Button>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search expert..."
                className="pl-14 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all placeholder:text-slate-400 w-80 shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Doctor Selection */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between px-2">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Available <span className="text-primary italic">Experts</span></h2>
                <p className="text-sm text-slate-500 font-medium mt-1">{doctors.length} verified doctors</p>
              </div>
              <Badge className="bg-blue-50 text-primary border-none font-bold text-[10px] uppercase tracking-wider px-5 py-2 rounded-full">
                {selectedDoctor ? 'Selected' : 'None Selected'}
              </Badge>
            </div>
            
            <div className="space-y-6">
              {doctors.map((doctor) => (
                <Card
                  key={doctor._id}
                  className={`p-10 border-2 transition-all duration-500 group relative bg-white rounded-[2.5rem] cursor-pointer ${
                    selectedDoctor === doctor._id
                      ? 'border-primary shadow-2xl shadow-primary/10 bg-blue-50/20'
                      : 'border-slate-50 shadow-lg shadow-black/5 hover:border-primary/20 hover:shadow-xl hover:-translate-y-1'
                  }`}
                  onClick={() => setSelectedDoctor(doctor._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-6 mb-8">
                        <div className="h-20 w-20 rounded-[1.8rem] bg-slate-50 flex items-center justify-center text-primary font-black text-3xl border border-slate-100 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                          {doctor.name[0]}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 italic">World Class Expert</p>
                          <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{doctor.name}</h3>
                          <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-tighter">{doctor.specialty}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-8 mb-8">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</p>
                            <p className="text-lg font-black text-slate-900">{doctor.experience} Years</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-amber-500">
                            <Star className="w-5 h-5 fill-amber-500" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</p>
                            <p className="text-lg font-black text-slate-900">{doctor.rating}/5.0</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{doctor.location}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full">
                          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Available Since {doctor.availability}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-8 border-none shadow-2xl bg-white rounded-[3rem] sticky top-24">
              <div className="space-y-10">
                <div className="text-center space-y-2">
                  <div className="h-16 w-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary mx-auto mb-6">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Visit <span className="text-primary italic">Summary</span></h3>
                  <p className="text-sm font-bold text-slate-400">Complete your booking below</p>
                </div>

                {error && (
                  <div className="p-5 bg-rose-50 border-2 border-rose-100 rounded-[1.5rem] text-rose-600 font-bold text-xs flex gap-3 items-start animate-fade-in">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-8">
                  {/* Doctor Mini Card */}
                  {selectedDoctorData && (
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Selected Doctor</p>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-black">{selectedDoctorData.name[0]}</div>
                          <div>
                            <p className="font-bold text-slate-900 tracking-tight leading-none">{selectedDoctorData.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{selectedDoctorData.specialty}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <MapPin className="w-3.5 h-3.5" />
                          {selectedDoctorData.location}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Date Input */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visit Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-5 py-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] text-sm font-bold focus:bg-white focus:border-primary/20 transition-all shadow-inner outline-none"
                    />
                  </div>

                  {/* Time Slots */}
                  {selectedDoctor && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Available Times</label>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedDoctorData?.availableSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`p-4 rounded-[1.2rem] font-bold text-xs transition-all border-2 flex items-center justify-center gap-2 ${
                              selectedTime === slot
                                ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20'
                                : 'bg-white text-slate-600 border-slate-100 hover:border-primary/20 hover:bg-primary/5'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pricing and Confirmation */}
                  {selectedDoctor && selectedDate && selectedTime && (
                    <div className="p-8 bg-emerald-50 rounded-[2.5rem] border-2 border-emerald-100 space-y-6">
                      <div className="space-y-3 text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                        <div className="flex justify-between">
                          <span>Service</span>
                          <span className="text-slate-900">Medical Visit</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time</span>
                          <span className="text-slate-900">{selectedTime}</span>
                        </div>
                        <div className="flex justify-between pt-4 border-t border-emerald-200">
                          <span>Total Amount</span>
                          <span className="text-xl font-black text-slate-900 font-sans">${selectedDoctorData?.consultationFee || 150}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleBooking}
                    disabled={!selectedDoctor || !selectedDate || !selectedTime || booking}
                    className="w-full h-18 rounded-[2rem] font-black text-lg shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white transition-all disabled:opacity-30 leading-none group"
                  >
                    {booking ? (
                      <div className="flex items-center gap-3">
                        <Activity className="w-6 h-6 animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span>Confirm Visit</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

