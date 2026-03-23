import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Payment, Appointment, User, Doctor } from '@/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    let query = {};
    if (patientId) {
      const appointments = await mongoose.model('Appointment').find({ patientId }).select('_id');
      const appointmentIds = appointments.map((a: any) => a._id);
      query = { appointmentId: { $in: appointmentIds } };
    }

    const payments = await Payment.find(query)
      .populate({
        path: 'appointmentId',
        populate: [
          {
            path: 'doctorId',
            select: 'name specialty consultationFee'
          },
          {
            path: 'patientId',
            select: 'firstName lastName email'
          }
        ]
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const payment = new Payment({
      appointmentId: body.appointmentId,
      amount: body.amount,
      status: body.status || 'pending',
      paymentMethod: body.paymentMethod,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    });

    await payment.save();
    
    // Update the corresponding appointment
    await Appointment.findByIdAndUpdate(body.appointmentId, {
      paymentStatus: body.status || 'paid',
      paymentId: payment._id,
      // If it's a confirmed payment, we might want to ensure the status is 'scheduled' or 'completed'
      // For now, let's just sync the payment info
    });

    return NextResponse.json({
      success: true,
      data: payment,
      message: 'Payment created successfully'
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
