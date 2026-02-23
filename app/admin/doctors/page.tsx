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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Doctor <span className="text-primary italic">Directory</span></h1>
          <p className="text-muted-foreground font-medium">Manage all doctors</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl font-bold gap-2 h-12 px-6 bg-white border-border/50"
            onClick={fetchDoctors}
            disabled={refreshing}
          >
            <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          <Button
            className="gap-2 rounded-xl font-bold h-12 px-8 shadow-lg shadow-primary/20"
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
                availability: 'Available Today',
                availableSlots: [],
                rating: 5.0
              });
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-5 h-5" />
            Add Doctor
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-4 border-none shadow-xl shadow-primary/5 mb-8 bg-white/80 backdrop-blur-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary" />
          <Input
            type="text"
            placeholder="Search by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-14 bg-transparent border-none text-lg font-medium focus-visible:ring-0 placeholder:text-muted-foreground/60"
          />
        </div>
      </Card>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <div className="bg-muted p-10 rounded-full w-fit mx-auto mb-6 opacity-20">
              <Search className="w-20 h-20" />
            </div>
            <h3 className="text-2xl font-black text-foreground">No Doctors Found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">Try adjusting your search filters or add a new doctor.</p>
          </div>
        ) : (
          filteredDoctors.map((doctor) => (
            <Card key={doctor._id} className="p-6 border-none shadow-sm hover:shadow-xl transition-all duration-500 group relative bg-white rounded-[2rem] overflow-hidden flex flex-col h-full">
              <div className="absolute top-0 right-0 p-6 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-xl shadow-lg border border-border"
                  onClick={() => {
                    setCurrentDoctor(doctor);
                    setIsModalOpen(true);
                  }}
                >
                  <Edit2 className="w-4 h-4 text-primary" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="rounded-xl shadow-lg"
                  onClick={() => setDeleteConfirm(doctor._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-5 mb-6">
                <div className="h-20 w-20 rounded-3xl bg-primary/5 flex items-center justify-center text-primary font-black text-2xl border border-primary/10">
                  {doctor.name[0]}
                </div>
                <div className="pr-12">
                  <h3 className="font-black text-xl text-foreground tracking-tight line-clamp-1">{doctor.name}</h3>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[10px] uppercase tracking-tighter">
                    {doctor.specialty}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4 mb-8 flex-grow">
                <div className="flex items-center gap-3 text-sm font-bold text-foreground/70">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span>{doctor.experience} Years Tenure</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-foreground/70">
                  <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="truncate">{doctor.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-foreground/70">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                    <Star className="w-4 h-4" />
                  </div>
                  <span>{doctor.rating} Rating</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-foreground/70">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="truncate">{doctor.education}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-muted/50 flex items-center justify-between mt-auto">
                <div>
                  <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Consultation</p>
                  <p className="text-2xl font-black text-primary">${doctor.consultationFee}</p>
                </div>
                <Badge variant="outline" className="rounded-lg h-10 px-4 font-bold border-border/50 text-foreground/60 italic">
                  {doctor.availability}
                </Badge>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <Card className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl border-none overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="bg-primary/5 p-8 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight">
                  {currentDoctor?._id ? 'Edit Credentials' : 'Register New Official'}
                </h2>
                <p className="text-sm text-muted-foreground font-medium">Verify all medical documentation before saving.</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white" onClick={() => setIsModalOpen(false)}>
                <X className="w-6 h-6" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                  <Input
                    value={currentDoctor?.name}
                    onChange={(e) => setCurrentDoctor({ ...currentDoctor, name: e.target.value })}
                    placeholder="Dr. Alexander Pierce"
                    className="h-12 rounded-xl font-bold border-border/50 bg-muted/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Specialization</label>
                  <Input
                    value={currentDoctor?.specialty}
                    onChange={(e) => setCurrentDoctor({ ...currentDoctor, specialty: e.target.value })}
                    placeholder="Neurosurgeon"
                    className="h-12 rounded-xl font-bold border-border/50 bg-muted/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                  <Input
                    value={currentDoctor?.email}
                    onChange={(e) => setCurrentDoctor({ ...currentDoctor, email: e.target.value })}
                    type="email"
                    placeholder="alex.p@medicare.com"
                    className="h-12 rounded-xl font-bold border-border/50 bg-muted/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Phone Number</label>
                  <Input
                    value={currentDoctor?.phone}
                    onChange={(e) => setCurrentDoctor({ ...currentDoctor, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="h-12 rounded-xl font-bold border-border/50 bg-muted/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Clinical Unit / Location</label>
                  <Input
                    value={currentDoctor?.location}
                    onChange={(e) => setCurrentDoctor({ ...currentDoctor, location: e.target.value })}
                    placeholder="St. Johns Pavillion"
                    className="h-12 rounded-xl font-bold border-border/50 bg-muted/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Education / Degrees</label>
                  <Input
                    value={currentDoctor?.education}
                    onChange={(e) => setCurrentDoctor({ ...currentDoctor, education: e.target.value })}
                    placeholder="MD, Johns Hopkins University"
                    className="h-12 rounded-xl font-bold border-border/50 bg-muted/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Consultation Fee ($)</label>
                  <Input
                    value={currentDoctor?.consultationFee}
                    onChange={(e) => setCurrentDoctor({ ...currentDoctor, consultationFee: Number(e.target.value) })}
                    type="number"
                    className="h-12 rounded-xl font-bold border-border/50 bg-muted/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Experience (Years)</label>
                  <Input
                    value={currentDoctor?.experience}
                    onChange={(e) => setCurrentDoctor({ ...currentDoctor, experience: Number(e.target.value) })}
                    type="number"
                    className="h-12 rounded-xl font-bold border-border/50 bg-muted/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">General Availability</label>
                  <Input
                    value={currentDoctor?.availability}
                    onChange={(e) => setCurrentDoctor({ ...currentDoctor, availability: e.target.value })}
                    placeholder="Mon-Fri, 9AM-5PM"
                    className="h-12 rounded-xl font-bold border-border/50 bg-muted/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Time Slots (CSV)</label>
                  <Input
                    value={Array.isArray(currentDoctor?.availableSlots) ? currentDoctor?.availableSlots.join(', ') : currentDoctor?.availableSlots}
                    onChange={(e) => setCurrentDoctor({ ...currentDoctor, availableSlots: e.target.value as any })}
                    placeholder="9:00 AM, 10:00 AM, 2:00 PM"
                    className="h-12 rounded-xl font-bold border-border/50 bg-muted/20"
                  />
                </div>
                <div className="col-span-full space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Professional Biography</label>
                  <textarea
                    value={currentDoctor?.about}
                    onChange={(e) => setCurrentDoctor({ ...currentDoctor, about: e.target.value })}
                    placeholder="Brief description of the doctor's background and expertise..."
                    className="w-full p-4 rounded-xl font-bold border border-border/50 bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                    required
                  />
                </div>
              </div>
              <div className="col-span-full pt-8 flex gap-4">
                <Button variant="outline" type="button" className="flex-1 h-14 rounded-2xl font-black border-2" onClick={() => setIsModalOpen(false)}>
                  Discard
                </Button>
                <Button className="flex-1 h-14 rounded-2xl font-black shadow-xl shadow-primary/20" type="submit">
                  {currentDoctor?._id ? 'Update Doctor' : 'Complete Registration'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <Card className="p-8 border-none shadow-2xl max-w-sm bg-white rounded-[2.5rem] text-center animate-in zoom-in-95 duration-300">
            <div className="bg-rose-500/10 p-5 rounded-full w-fit mx-auto mb-6">
              <Trash2 className="w-10 h-10 text-rose-600" />
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight mb-2">Terminate Profile?</h2>
            <p className="text-muted-foreground font-medium mb-8">
              This will immediately remove the doctor from the directory.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl font-bold border-2"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-rose-500/20"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Confirm Removal
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
