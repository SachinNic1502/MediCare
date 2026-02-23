'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
}

export function ServiceCard({ icon: Icon, title, description, features }: ServiceCardProps) {
  return (
    <Card className="p-6 border-border hover:shadow-lg transition">
      <Icon className="w-12 h-12 text-primary mb-4" />
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm mb-4">{description}</p>
      <ul className="space-y-2 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5">•</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button variant="outline" className="w-full">
        Learn More
      </Button>
    </Card>
  );
}
