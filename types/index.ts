export type UserRole = 'patient' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

export interface Doctor {
  _id: string;
  name: string;
  email: string;
  specialty: string;
  experience: number;
  location: string;
  availability: string;
  rating: number;
  reviews: number;
  image?: string;
  consultationFee: number;
  isActive: boolean;
}

export interface Appointment {
  _id: string;
  patientId: string | User;
  doctorId: string | Doctor;
  date: Date | string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  consultationFee: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentId?: string;
  symptoms: string[];
  diagnosis?: string;
  prescription?: string;
  followUpRequired: boolean;
  followUpDate?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
