import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Appointment } from '@/models/Appointment';
import { Doctor } from '@/models/Doctor';
import { User } from '@/models/User';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // In a real app, you'd check for admin authorization here

        const [totalPatients, totalAppointments, totalDoctors, appointments] = await Promise.all([
            User.countDocuments({ role: 'patient' }),
            Appointment.countDocuments({}),
            Doctor.countDocuments({ isActive: true }),
            Appointment.find({})
                .populate('patientId', 'firstName lastName')
                .populate('doctorId', 'name specialty')
                .sort({ date: -1, time: -1 })
                .limit(10)
        ]);

        // Calculate revenue (mock logic: sum of consultation fees for completed appointments)
        const completedAppointments = await Appointment.find({ status: 'completed' });
        const totalRevenue = completedAppointments.reduce((sum, app) => sum + (app.consultationFee || 0), 0);

        // Group appointments by day for the chart (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        const trendData = await Promise.all(last7Days.map(async (dateStr) => {
            const startOfDay = new Date(dateStr);
            const endOfDay = new Date(dateStr);
            endOfDay.setDate(endOfDay.getDate() + 1);

            const count = await Appointment.countDocuments({
                date: { $gte: startOfDay, $lt: endOfDay }
            });

            const dayRevenue = await Appointment.aggregate([
                { $match: { date: { $gte: startOfDay, $lt: endOfDay }, status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$consultationFee' } } }
            ]);

            return {
                name: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
                appointments: count,
                revenue: dayRevenue[0]?.total || 0
            };
        }));

        return NextResponse.json({
            success: true,
            stats: {
                totalPatients,
                totalAppointments,
                totalDoctors,
                revenue: `$${totalRevenue.toLocaleString()}`
            },
            recentAppointments: appointments.map(app => ({
                id: app._id,
                patientName: app.patientId ? `${(app.patientId as any).firstName} ${(app.patientId as any).lastName}` : 'Unknown',
                doctorName: app.doctorId ? (app.doctorId as any).name : 'Unknown',
                date: app.date.toISOString().split('T')[0],
                time: app.time,
                status: app.status
            })),
            trendData
        });
    } catch (error: any) {
        console.error('Admin stats error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch admin statistics' },
            { status: 500 }
        );
    }
}
