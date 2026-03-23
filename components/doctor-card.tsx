'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock } from 'lucide-react';
import { Doctor } from '@/types';

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
    <Card className="overflow-hidden border border-slate-100 bg-white shadow-2xl shadow-slate-100/50 transition-all duration-500 hover:-translate-y-2 group rounded-[2.5rem] flex flex-col">
      {/* Image / Header Section */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10 opacity-60" />
        {image && image.startsWith('http') ? (
          <Image 
            src={image} 
            alt={name} 
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-50 z-20">
            {image || '👨‍⚕️'}
          </div>
        )}
        <div className="absolute bottom-6 left-6 z-30">
          <Badge className="bg-primary hover:bg-primary/90 text-white border-none px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-widest">
            {specialty}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8 flex-1 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <h3 className="font-black text-2xl text-slate-900 tracking-tight leading-tight">{name}</h3>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span className="text-xs font-black">{rating}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 text-sm font-bold text-slate-500">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-50 text-primary">
                <Clock className="w-4 h-4" />
              </div>
              <span>{experience} years seniority</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-50 text-primary">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="line-clamp-1">{location}</span>
            </div>
          </div>

          <div className="p-5 rounded-[1.8rem] bg-slate-50 border border-slate-100">
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Available Since</p>
            <p className="text-sm font-black text-slate-900">{availability}</p>
          </div>
        </div>

        <Link href={`/patient/book-appointment?doctorId=${id}`} className="mt-8">
          <Button className="w-full h-14 rounded-2xl font-black text-white shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95 leading-none">
            Book a Visit
          </Button>
        </Link>
      </div>
    </Card>
  );
}

