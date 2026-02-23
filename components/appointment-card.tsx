'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, MoreHorizontal, Activity } from 'lucide-react';

interface AppointmentCardProps {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  onCancel?: () => void;
  onReschedule?: () => void;
}

export function AppointmentCard({
  id,
  doctorName,
  specialty,
  date,
  time,
  location,
  status,
  notes,
  onCancel,
  onReschedule,
}: AppointmentCardProps) {
  const statusConfig = {
    scheduled: { color: 'text-blue-600 bg-blue-500/10 border-blue-200', text: 'Confirmed' },
    completed: { color: 'text-emerald-600 bg-emerald-500/10 border-emerald-200', text: 'Checked Out' },
    cancelled: { color: 'text-rose-600 bg-rose-500/10 border-rose-200', text: 'Terminated' },
  };

  const currentStatus = statusConfig[status];

  return (
    <Card className={`p-6 border border-border/50 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 group ${status === 'cancelled' ? 'opacity-60 grayscale' : ''
      }`}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1 flex gap-5">
          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500 ${status === 'scheduled' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-black text-xl text-foreground tracking-tight">{doctorName}</h3>
              <Badge className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter border ${currentStatus.color}`}>
                {currentStatus.text}
              </Badge>
            </div>
            <p className="text-sm font-bold text-muted-foreground mb-4">{specialty}</p>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground/70">
                <div className="p-1.5 rounded-lg bg-muted flex items-center justify-center text-primary">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                {date}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-foreground/70">
                <div className="p-1.5 rounded-lg bg-muted flex items-center justify-center text-primary">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                {time}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-foreground/70">
                <div className="p-1.5 rounded-lg bg-muted flex items-center justify-center text-primary">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                {location}
              </div>
            </div>
          </div>
        </div>

        {status === 'scheduled' && (
          <div className="flex flex-row md:flex-col gap-2 min-w-[120px]">
            <Button
              variant="outline"
              size="sm"
              onClick={onReschedule}
              className="font-bold rounded-xl h-10 border-2 hover:bg-muted"
            >
              Adjust
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="font-bold rounded-xl h-10 text-rose-600 hover:bg-rose-50/50 hover:text-rose-700 hover:border-rose-100"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {notes && (
        <div className="mt-6 p-4 rounded-2xl bg-muted/30 border border-muted flex items-start gap-4">
          <div className="bg-white p-2 rounded-xl shadow-sm border border-border/50">
            <MoreHorizontal className="w-4 h-4 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground/80 italic">"{notes}"</p>
        </div>
      )}
    </Card>
  );
}

