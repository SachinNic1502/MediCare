import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Appointment } from '@/models';

export async function GET(
  request: NextRequest,
) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    const appointments = await Appointment.find({
      patientId: patientId
    })
      .populate({
        path: 'doctorId',
        select: 'name specialty location'
      })
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: appointments
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

    const appointment = new Appointment({
      patientId: body.patientId,
      doctorId: body.doctorId,
      date: body.date,
      time: body.time,
      status: 'scheduled',
      notes: body.notes,
      createdAt: new Date(),
    });

    await appointment.save();

    return NextResponse.json({
      success: true,
      data: appointment,
      message: 'Appointment created successfully'
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
