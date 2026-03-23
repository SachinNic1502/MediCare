'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Search,
  Stethoscope,
  MapPin,
  Clock,
  Star,
  RefreshCcw,
  X,
  FileText,
  Phone,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  location: string;
  email: string;
  phone: string;
  education: string;
  about: string;
  consultationFee: number;
  availability: string;
  availableSlots: string[];
  reviews?: number;
}

export default function AdminDoctorsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState<Partial<Doctor> | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchDoctors = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/doctors');
      const result = await response.json();
      if (result.success) {
        setDoctors(result.data);
      }
    } catch (error) {
      toast.error('Failed to sync doctor database');
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
    fetchDoctors();
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!currentDoctor?._id;
    const url = isEditing ? `/api/doctors/${currentDoctor._id}` : '/api/doctors';
    const method = isEditing ? 'PUT' : 'POST';

    // Ensure availableSlots is an array if it comes as a string
    const payload = {
      ...currentDoctor,
      availableSlots: Array.isArray(currentDoctor?.availableSlots)
        ? currentDoctor.availableSlots
        : (currentDoctor?.availableSlots as any || '').split(',').map((s: string) => s.trim()).filter(Boolean)
    };

    if (!isEditing && payload.availableSlots.length === 0) {
      payload.availableSlots = ['09:00 AM', '10:00 AM', '02:00 PM', '04:00 PM'];
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(isEditing ? 'Doctor profile updated' : 'New doctor registered');
        setIsModalOpen(false);
        fetchDoctors();
      } else {
        toast.error(result.error || 'Operation failed');
      }
    } catch (error) {
      toast.error('Network error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/doctors/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        toast.success('Doctor removed from system');
        setDeleteConfirm(null);
        fetchDoctors();
      } else {
        toast.error('Deletion failed');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <ActivityIcon />
        <p className="text-muted-foreground font-bold animate-pulse mt-4">Accessing Medical Directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-3">
            <Stethoscope className="w-4 h-4" />
            Medical Professionals
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Expert <span className="text-primary italic">Registry.</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-lg">Manage medical staff and consultant credentials</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="rounded-2xl font-black gap-2 h-14 px-8 bg-white border-2 border-slate-100 text-slate-900 hover:bg-slate-50 transition-all"
            onClick={fetchDoctors}
            disabled={refreshing}
          >
            <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''} text-primary`} />
            Refresh
          </Button>
          <Button
            className="gap-2 rounded-2xl font-black h-14 px-8 shadow-xl shadow-primary/20 bg-primary text-white hover:bg-primary/90 transition-all active:scale-95"
            onClick={() => {
              setCurrentDoctor({
                name: '',
                specialty: '',
                location: '',
                experience: 0,
                email: '',
                phone: '',
                education: '',
                about: '',
                consultationFee: 100,
                availability: 'Monday - Friday',
                availableSlots: [],
                rating: 5.0
              });
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-5 h-5 mr-1" />
            Register Expert
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-2 border-none shadow-xl shadow-slate-200/50 rounded-3xl bg-white overflow-hidden">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder="Search by name, specialty, or clinical unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-16 h-16 bg-transparent border-none text-lg font-bold text-slate-900 focus-visible:ring-0 placeholder:text-slate-400"
          />
        </div>
      </Card>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDoctors.length === 0 ? (
          <div className="col-span-full py-32 text-center rounded-[3rem] bg-slate-50/50 border-2 border-dashed border-slate-100">
            <div className="bg-white shadow-xl shadow-slate-200 p-10 rounded-full w-fit mx-auto mb-8">
              <Search className="w-16 h-16 text-slate-200" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Registry Entry Not Found</h3>
            <p className="text-slate-400 font-medium max-w-sm mx-auto mt-4 text-lg">Your search didn't match any active professionals in our system.</p>
          </div>
        ) : (
          filteredDoctors.map((doctor) => (
            <Card key={doctor._id} className="p-8 border border-slate-50 bg-white shadow-xl shadow-slate-200/50 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 group relative overflow-hidden flex flex-col h-full">
              <div className="absolute top-6 right-6 flex gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 z-20">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-xl shadow-xl border-none bg-white hover:bg-primary hover:text-white transition-all text-primary"
                  onClick={() => {
                    setCurrentDoctor(doctor);
                    setIsModalOpen(true);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-10 w-10 rounded-xl shadow-xl border-none transition-all"
                  onClick={() => setDeleteConfirm(doctor._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="relative mb-8">
                <div className="h-24 w-24 rounded-[2rem] bg-slate-900 flex items-center justify-center text-white font-black text-2xl border-4 border-slate-50 group-hover:scale-110 transition-transform duration-500">
                  {doctor.name[0]}
                </div>
                <div className="mt-8">
                  <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-[0.15em] px-3 py-1.5 rounded-lg mb-3">
                    {doctor.specialty}
                  </Badge>
                  <h3 className="font-black text-2xl text-slate-900 tracking-tight line-clamp-1">{doctor.name}</h3>
                </div>
              </div>

              <div className="space-y-6 mb-10 flex-grow">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-black text-slate-900">{doctor.experience} Years</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinical Tenure</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-black text-slate-900 truncate max-w-[180px]">{doctor.location}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Unit</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-black text-slate-900 truncate max-w-[180px]">{doctor.education}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Highest Degree</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50 flex items-center justify-between mt-auto">
                <div>
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none mb-2">Visit Fee</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter">${doctor.consultationFee}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm font-black text-slate-900">{doctor.rating}</span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4 z-[100] animate-in fade-in duration-500">
          <Card className="w-full max-w-4xl bg-white rounded-[3.5rem] shadow-2xl border-none overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 max-h-[90vh] flex flex-col p-1">
            <div className="bg-slate-50/50 p-12 flex items-center justify-between shrink-0 border-b border-slate-100 rounded-t-[3.4rem]">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                  {currentDoctor?._id ? 'Edit Credentials.' : 'Register Expert.'}
                </h2>
                <p className="text-slate-500 font-medium text-lg mt-2 font-display">Manage professional documentation and clinical status</p>
              </div>
              <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full bg-white shadow-xl hover:bg-slate-900 hover:text-white transition-all" onClick={() => setIsModalOpen(false)}>
                <X className="w-6 h-6" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="p-12 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Identity</label>
                  <Input
                    value={currentDoctor?.name}
                    onChange={(e) => setCurrentDoctor({ ...currentDoctor, name: e.target.value })}
                    placeholder="Dr. Alexander Pierce"
                    className="h-14 rounded-2xl font-black border-2 border-slate-50 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-lg pl-6"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Medical Specialty</label>
                  <Input
                    value={currentDoctor?.specialty}
                    onChange={(e) => setCurrentDoctor({ ...currentDoctor, specialty: e.target.value })}
                    placeholder="Neurosurgeon"
                    className="h-14 rounded-2xl font-black border-2 border-slate-50 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-lg pl-6"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Professional Email</label>
                  <Input
                    value={currentDoctor?.email}
                    onChange={(e) => setCurrentDoctor({ ...currentDoctor, email: e.target.value })}
                    type="email"
                    placeholder="expert@medicare.com"
                    className="h-14 rounded-2xl font-black border-2 border-slate-50 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-lg pl-6"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Direct Contact No.</label>
                  <Input
                    value={currentDoctor?.phone}
                    onChange={(e) => setCurrentDoctor({ ...currentDoctor, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="h-14 rounded-2xl font-black border-2 border-slate-50 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-lg pl-6"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Clinical Unit / Location</label>
                  <Input
                    value={currentDoctor?.location}
                    onChange={(e) => setCurrentDoctor({ ...currentDoctor, location: e.target.value })}
                    placeholder="St. Johns Pavillion"
                    className="h-14 rounded-2xl font-black border-2 border-slate-50 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-lg pl-6"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Highest Medical Degree</label>
                  <Input
                    value={currentDoctor?.education}
                    onChange={(e) => setCurrentDoctor({ ...currentDoctor, education: e.target.value })}
                    placeholder="MD, FRCS Surgery"
                    className="h-14 rounded-2xl font-black border-2 border-slate-50 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-lg pl-6"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Consultation Fee ($)</label>
                  <Input
                    value={currentDoctor?.consultationFee}
                    onChange={(e) => setCurrentDoctor({ ...currentDoctor, consultationFee: Number(e.target.value) })}
                    type="number"
                    className="h-14 rounded-2xl font-black border-2 border-slate-50 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-lg pl-6"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Experience (Years)</label>
                  <Input
                    value={currentDoctor?.experience}
                    onChange={(e) => setCurrentDoctor({ ...currentDoctor, experience: Number(e.target.value) })}
                    type="number"
                    className="h-14 rounded-2xl font-black border-2 border-slate-50 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-lg pl-6"
                    required
                  />
                </div>
                <div className="col-span-full space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Clinical Bio / Summary</label>
                  <textarea
                    value={currentDoctor?.about}
                    onChange={(e) => setCurrentDoctor({ ...currentDoctor, about: e.target.value })}
                    placeholder="Detailed professional background and clinical expertise..."
                    className="w-full p-6 rounded-3xl font-bold border-2 border-slate-50 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-lg outline-none min-h-[150px] resize-none"
                    required
                  />
                </div>
              </div>
              <div className="col-span-full pt-12 flex gap-6">
                <Button variant="outline" type="button" className="flex-1 h-20 rounded-[1.8rem] font-black uppercase tracking-widest border-2 border-slate-100 text-slate-900 hover:bg-slate-50 transition-all" onClick={() => setIsModalOpen(false)}>
                  Cancel Registry
                </Button>
                <Button className="flex-1 h-20 rounded-[1.8rem] font-black uppercase tracking-widest shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white transition-all active:scale-95 leading-none" type="submit">
                  {currentDoctor?._id ? 'Update Profile' : 'Finalize Registration'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl flex items-center justify-center p-4 z-[200] animate-in fade-in duration-300">
          <Card className="p-12 border-none shadow-2xl max-w-md bg-white rounded-[3.5rem] text-center animate-in zoom-in-95 duration-500">
            <div className="bg-rose-50 p-8 rounded-full w-fit mx-auto mb-10 shadow-xl shadow-rose-200/20">
              <Trash2 className="w-14 h-14 text-rose-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Terminate Account?</h2>
            <p className="text-slate-400 font-medium text-lg leading-relaxed mb-10">
              This action will permanently remove this expert from the professional registry.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="flex-1 h-16 rounded-2xl font-black border-2 border-slate-100 text-slate-900"
                onClick={() => setDeleteConfirm(null)}
              >
                Keep Active
              </Button>
              <Button
                variant="destructive"
                className="flex-1 h-16 rounded-2xl font-black shadow-xl shadow-rose-500/30"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Yes, Remove
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function ActivityIcon() {
  return (
    <div className="relative h-12 w-12 text-primary">
      <div className="absolute inset-0 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
      <Stethoscope className="absolute inset-0 m-auto w-6 h-6 animate-pulse" />
    </div>
  );
}
