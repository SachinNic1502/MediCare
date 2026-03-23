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
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
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
  const statusConfig: Record<string, { color: string; text: string }> = {
    scheduled: { color: 'text-blue-600 bg-blue-500/10 border-blue-200', text: 'Confirmed' },
    completed: { color: 'text-emerald-600 bg-emerald-500/10 border-emerald-200', text: 'Completed' },
    cancelled: { color: 'text-rose-600 bg-rose-500/10 border-rose-200', text: 'Cancelled' },
    'no-show': { color: 'text-amber-600 bg-amber-500/10 border-amber-200', text: 'Missed' },
  };

  const currentStatus = statusConfig[status];

  return (
    <Card className={`p-8 border border-border/40 bg-white shadow-2xl shadow-black/5 transition-all duration-500 hover:shadow-primary/5 group rounded-[2.2rem] overflow-hidden relative ${status === 'cancelled' ? 'opacity-60 grayscale' : ''
      }`}>
      {/* Background Accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 -mr-16 -mt-16 transition-colors duration-500 ${status === 'scheduled' ? 'bg-primary' : 'bg-muted'}`} />

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 relative z-10">
        <div className="flex-1 flex gap-6">
          <div className={`h-20 w-20 rounded-[1.8rem] flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-105 ${status === 'scheduled' ? 'bg-primary/5 text-primary' : 'bg-muted/50 text-muted-foreground'
            }`}>
            <Activity className="w-10 h-10" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-black text-2xl text-foreground tracking-tight leading-tight">{doctorName}</h3>
                <Badge className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border-none ${currentStatus.color}`}>
                  {currentStatus.text}
                </Badge>
              </div>
              <p className="text-sm font-bold text-muted-foreground opacity-60 uppercase tracking-widest">{specialty}</p>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <div className="flex items-center gap-2.5 text-xs font-bold text-foreground/70">
                <div className="p-2 rounded-xl bg-muted/50 flex items-center justify-center text-primary">
                  <Calendar className="w-4 h-4" />
                </div>
                {date}
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-foreground/70">
                <div className="p-2 rounded-xl bg-muted/50 flex items-center justify-center text-primary">
                  <Clock className="w-4 h-4" />
                </div>
                {time}
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-foreground/70">
                <div className="p-2 rounded-xl bg-muted/50 flex items-center justify-center text-primary">
                  <MapPin className="w-4 h-4" />
                </div>
                {location}
              </div>
            </div>
          </div>
        </div>

        {status === 'scheduled' && (
          <div className="flex flex-row md:flex-col gap-3 shrink-0">
            <Button
              variant="outline"
              size="lg"
              onClick={onReschedule}
              className="font-black rounded-2xl h-14 px-8 border-2 border-muted hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all"
            >
              Reschedule
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={onCancel}
              className="font-black rounded-2xl h-14 px-8 text-rose-600 hover:bg-rose-50/50 hover:text-rose-700 transition-all"
            >
              Terminate
            </Button>
          </div>
        )}
      </div>

      {notes && (
        <div className="mt-8 p-6 rounded-[1.8rem] bg-muted/20 border border-muted/50 flex items-start gap-4 transition-all group-hover:bg-muted/30">
          <div className="bg-white p-2.5 rounded-xl shadow-sm border border-border/30 text-primary">
            <MoreHorizontal className="w-4 h-4" />
          </div>
          <p className="text-sm font-semibold text-foreground/70 italic leading-relaxed">"{notes}"</p>
        </div>
      )}
    </Card>
  );
}

