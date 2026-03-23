'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Stethoscope, 
  Calendar, 
  Users, 
  Shield,
  Heart,
  Bone,
  Brain,
  Baby,
  Smile,
  Eye,
  Pill
} from 'lucide-react';

import { CheckCircle2 } from 'lucide-react';

const iconMap = {
  Stethoscope,
  Calendar,
  Users,
  Shield,
  Heart,
  Bone,
  Brain,
  Baby,
  Smile,
  Eye,
  Pill
};

interface ServiceCardProps {
  icon: keyof typeof iconMap;
  title: string;
  description: string;
  features: string[];
}

export function ServiceCard({ icon, title, description, features }: ServiceCardProps) {
  const Icon = iconMap[icon];
  return (
    <Card className="p-10 border border-slate-100 bg-white shadow-2xl shadow-slate-100/50 transition-all duration-500 hover:-translate-y-2 group rounded-[2.5rem] flex flex-col justify-between">
      <div>
        <div className="w-16 h-16 rounded-[1.8rem] bg-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500">
          {Icon && <Icon className="w-8 h-8 text-primary group-hover:text-white" />}
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight uppercase tracking-widest text-xs opacity-40">Clinical Department</h3>
        <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
        <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed">{description}</p>
        
        <div className="space-y-3 mb-10">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3 text-slate-600 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-slate-100 font-black text-slate-900 hover:bg-primary hover:text-white hover:border-primary transition-all">
        Consult Details
      </Button>
    </Card>
  );
}
