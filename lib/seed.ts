import connectDB from './mongodb';
import { Doctor } from '../models/Doctor';
import { User } from '../models/User';
import { Appointment } from '../models/Appointment';
import bcrypt from 'bcryptjs';

const sampleDoctors = [
  {
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    experience: 12,
    rating: 4.9,
    location: 'New York, NY',
    availability: 'Tomorrow, 2:00 PM',
    availableSlots: ['10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'],
    email: 'sarah.johnson@medicare.com',
    phone: '+1 (555) 123-4567',
    education: 'MD from Harvard Medical School',
    about: 'Dr. Johnson is a board-certified cardiologist with over 12 years of experience in treating heart conditions.',
    consultationFee: 250,
    reviews: 128,
  },
  {
    name: 'Dr. Michael Chen',
    specialty: 'Orthopedics',
    experience: 10,
    rating: 4.8,
    location: 'Boston, MA',
    availability: 'Today, 4:30 PM',
    availableSlots: ['9:00 AM', '10:30 AM', '1:00 PM', '4:00 PM'],
    email: 'michael.chen@medicare.com',
    phone: '+1 (555) 234-5678',
    education: 'MD from Johns Hopkins University',
    about: 'Dr. Chen specializes in sports medicine and joint replacement surgery.',
    consultationFee: 200,
    reviews: 95,
  },
  {
    name: 'Dr. Emily Wilson',
    specialty: 'Neurology',
    experience: 8,
    rating: 4.7,
    location: 'Los Angeles, CA',
    availability: 'Friday, 10:00 AM',
    availableSlots: ['10:00 AM', '11:30 AM', '2:30 PM', '3:30 PM'],
    email: 'emily.wilson@medicare.com',
    phone: '+1 (555) 345-6789',
    education: 'MD from Stanford University',
    about: 'Dr. Wilson is an expert in treating neurological disorders and brain injuries.',
    consultationFee: 300,
    reviews: 76,
  },
  {
    name: 'Dr. James Brown',
    specialty: 'Pediatrics',
    experience: 15,
    rating: 5.0,
    location: 'Chicago, IL',
    availability: 'Monday, 9:00 AM',
    availableSlots: ['9:30 AM', '11:00 AM', '1:30 PM', '3:30 PM'],
    email: 'james.brown@medicare.com',
    phone: '+1 (555) 456-7890',
    education: 'MD from Yale Medical School',
    about: 'Dr. Brown has been caring for children for over 15 years and specializes in pediatric care.',
    consultationFee: 150,
    reviews: 203,
  },
  {
    name: 'Dr. Lisa Martinez',
    specialty: 'Dermatology',
    experience: 7,
    rating: 4.6,
    location: 'Miami, FL',
    availability: 'Wednesday, 3:00 PM',
    availableSlots: ['8:00 AM', '10:00 AM', '2:00 PM', '4:00 PM'],
    email: 'lisa.martinez@medicare.com',
    phone: '+1 (555) 567-8901',
    education: 'MD from UCLA Medical School',
    about: 'Dr. Martinez specializes in skin conditions and cosmetic dermatology.',
    consultationFee: 180,
    reviews: 62,
  },
  {
    name: 'Dr. Robert Taylor',
    specialty: 'General Practice',
    experience: 20,
    rating: 4.8,
    location: 'Seattle, WA',
    availability: 'Tomorrow, 11:00 AM',
    availableSlots: ['8:30 AM', '11:00 AM', '2:30 PM', '4:30 PM'],
    email: 'robert.taylor@medicare.com',
    phone: '+1 (555) 678-9012',
    education: 'MD from University of Washington',
    about: 'Dr. Taylor provides comprehensive primary care for patients of all ages.',
    consultationFee: 120,
    reviews: 184,
  },
];

async function seedData() {
  try {
    await connectDB();
    console.log('Connected to MongoDB for seeding...');

    // 1. Seed Users
    await User.deleteMany({});
    const hashedPassword = await bcrypt.hash('password', 10);

    const admin = await User.create({
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });

    const patients = await User.insertMany([
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'patient@example.com',
        password: hashedPassword,
        role: 'patient'
      },
      {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: hashedPassword,
        role: 'patient'
      },
      {
        firstName: 'Robert',
        lastName: 'Wilson',
        email: 'robert.wilson@example.com',
        password: hashedPassword,
        role: 'patient'
      }
    ]);

    console.log('Successfully seeded Users (1 Admin, 3 Patients)');

    // 2. Seed Doctors
    await Doctor.deleteMany({});
    const insertedDoctors = await Doctor.insertMany(sampleDoctors);
    console.log(`Successfully seeded ${insertedDoctors.length} Doctors`);

    // 3. Seed Appointments
    await Appointment.deleteMany({});

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const appointments = [
      {
        patientId: patients[0]._id,
        doctorId: insertedDoctors[0]._id,
        date: tomorrow,
        time: '10:00 AM',
        status: 'scheduled',
        reason: 'General checkup',
        consultationFee: insertedDoctors[0].consultationFee,
        notes: 'Please arrive 15 minutes early'
      },
      {
        patientId: patients[1]._id,
        doctorId: insertedDoctors[1]._id,
        date: yesterday,
        time: '2:00 PM',
        status: 'completed',
        reason: 'Orthopedic consultation',
        consultationFee: insertedDoctors[1].consultationFee,
        notes: 'Orthopedic consultation successful'
      },
      {
        patientId: patients[2]._id,
        doctorId: insertedDoctors[2]._id,
        date: yesterday,
        time: '11:00 AM',
        status: 'completed',
        reason: 'Neurology checkup',
        consultationFee: insertedDoctors[2].consultationFee,
        notes: 'Neurology checkup done'
      },
      {
        patientId: patients[0]._id,
        doctorId: insertedDoctors[3]._id,
        date: today,
        time: '4:00 PM',
        status: 'scheduled',
        reason: 'Pediatric visit',
        consultationFee: insertedDoctors[3].consultationFee,
        notes: 'Regular checkup'
      }
    ];

    const insertedAppointments = await Appointment.insertMany(appointments);
    console.log(`Successfully seeded ${insertedAppointments.length} Appointments`);

    console.log('Seeding process complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedData();
}

export { seedData };
