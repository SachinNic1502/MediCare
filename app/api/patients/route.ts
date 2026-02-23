import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models/User';
import { Appointment } from '@/models/Appointment';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Fetch all users with role 'patient'
        const patients = await User.find({ role: 'patient' }).select('-password');

        // Enhance patient data with appointment counts
        const enhancedPatients = await Promise.all(patients.map(async (patient) => {
            const appointmentCount = await Appointment.countDocuments({ patientId: patient._id });
            const lastAppointment = await Appointment.findOne({ patientId: patient._id })
                .sort({ date: -1 })
                .select('date');

            return {
                ...patient.toObject(),
                appointmentCount,
                lastVisit: lastAppointment ? lastAppointment.date : null,
                status: 'active' // Simplified for now
            };
        }));

        return NextResponse.json({
            success: true,
            data: enhancedPatients
        });
    } catch (error) {
        console.error('Error fetching patients:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch patients' },
            { status: 500 }
        );
    }
}
