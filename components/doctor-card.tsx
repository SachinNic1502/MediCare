'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock } from 'lucide-react';

interface DoctorCardProps {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  reviews: number;
  location: string;
  availability: string;
  image?: string;
}

export function DoctorCard({
  id,
  name,
  specialty,
  experience,
  rating,
  reviews,
  location,
  availability,
  image,
}: DoctorCardProps) {
  return (
    <Card className="overflow-hidden border-border hover:shadow-lg transition">
      {/* Image Section */}
      <div className="bg-gradient-to-br from-primary to-accent p-8 text-center h-32 flex items-center justify-center">
        {image && image.startsWith('http') ? (
          <img src={image} alt={name} className="w-16 h-16 rounded-full" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary-foreground flex items-center justify-center text-2xl">
            {image || '👨‍⚕️'}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="font-semibold text-lg text-foreground mb-1">{name}</h3>

        <Badge variant="secondary" className="mb-4">
          {specialty}
        </Badge>

        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{experience} years experience</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-foreground font-medium">{rating}/5</span>
            <span className="text-muted-foreground">({reviews} reviews)</span>
          </div>
        </div>

        <div className="bg-muted p-3 rounded-md mb-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Next Available</p>
          <p className="text-sm font-semibold text-foreground">{availability}</p>
        </div>

        <Link href={`/patient/book-appointment?doctorId=${id}`}>
          <Button className="w-full">Book Appointment</Button>
        </Link>
      </div>
    </Card>
  );
}
