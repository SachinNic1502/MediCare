import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Appointment } from '@/models/Appointment';
import { Doctor } from '@/models/Doctor';
import { User } from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

    let query: any = {};

    if (patientId) {
      query.patientId = patientId;
    }

    if (doctorId) {
      query.doctorId = doctorId;
    }

    if (status) {
      query.status = status;
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const skip = (page - 1) * limit;

    const appointments = await Appointment.find(query)
      .populate('patientId', 'firstName lastName email')
      .populate('doctorId', 'name specialty location')
      .select('-__v')
      .sort({ date: -1, time: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Appointment.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Check if doctor exists
    const doctor = await Doctor.findById(body.doctorId);
    if (!doctor) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Check if the time slot is available
    const existingAppointment = await Appointment.findOne({
      doctorId: body.doctorId,
      date: new Date(body.date),
      time: body.time,
      status: { $in: ['scheduled', 'completed'] },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { success: false, error: 'This time slot is already booked' },
        { status: 400 }
      );
    }

    const appointment = new Appointment({
      ...body,
      consultationFee: doctor.consultationFee,
      date: new Date(body.date),
    });

    await appointment.save();

    // Populate the appointment details
    await appointment.populate('patientId', 'name email');
    await appointment.populate('doctorId', 'name specialty location');

    return NextResponse.json({
      success: true,
      data: appointment,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating appointment:', error);

    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
