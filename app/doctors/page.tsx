'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DoctorCard } from '@/components/doctor-card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  reviews: number;
  location: string;
  availability: string;
}

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  const doctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      experience: 12,
      rating: 4.9,
      reviews: 156,
      location: 'City Heart Center',
      availability: 'Tomorrow at 10:00 AM',
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialty: 'Orthopedics',
      experience: 10,
      rating: 4.8,
      reviews: 142,
      location: 'Bone & Joint Clinic',
      availability: 'Today at 3:00 PM',
    },
    {
      id: '3',
      name: 'Dr. Emily Wilson',
      specialty: 'Neurology',
      experience: 8,
      rating: 4.7,
      reviews: 128,
      location: 'Brain Health Institute',
      availability: 'Tomorrow at 2:00 PM',
    },
    {
      id: '4',
      name: 'Dr. James Brown',
      specialty: 'Pediatrics',
      experience: 15,
      rating: 5.0,
      reviews: 184,
      location: "Children's Hospital",
      availability: 'Today at 11:00 AM',
    },
    {
      id: '5',
      name: 'Dr. Lisa Anderson',
      specialty: 'Dermatology',
      experience: 9,
      rating: 4.8,
      reviews: 136,
      location: 'Skin Care Center',
      availability: 'Tomorrow at 4:00 PM',
    },
    {
      id: '6',
      name: 'Dr. Robert Martinez',
      specialty: 'General Practice',
      experience: 20,
      rating: 4.9,
      reviews: 201,
      location: 'Health First Medical Center',
      availability: 'Today at 1:00 PM',
    },
  ];

  const specialties = ['All', ...new Set(doctors.map((d) => d.specialty))];

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Our Doctors</h1>
          <p className="text-muted-foreground text-lg">
            Browse our team of experienced healthcare professionals
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="p-6 border-border mb-8">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search doctors by name, specialty, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12"
              />
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Specialty</label>
              <div className="flex flex-wrap gap-2">
                {specialties.map((specialty) => (
                  <Button
                    key={specialty}
                    variant={selectedSpecialty === specialty ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSpecialty(specialty)}
                  >
                    {specialty}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Results Info */}
        <p className="text-muted-foreground mb-6">
          Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
        </p>

        {/* Doctors Grid */}
        {filteredDoctors.length === 0 ? (
          <Card className="p-12 border-border text-center">
            <p className="text-muted-foreground text-lg">No doctors found matching your search.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                id={doctor.id}
                name={doctor.name}
                specialty={doctor.specialty}
                experience={doctor.experience}
                rating={doctor.rating}
                reviews={doctor.reviews}
                location={doctor.location}
                availability={doctor.availability}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
