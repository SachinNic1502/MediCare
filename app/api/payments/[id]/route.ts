import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Payment } from '@/models';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const payment = await Payment.findById(id)
      .populate({
        path: 'appointmentId',
        populate: {
          path: 'doctorId',
          select: 'name specialty'
        }
      })
      .lean();

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const payment = await Payment.findById(id);

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment status to paid
    payment.status = 'paid';
    payment.paidAt = new Date();
    await payment.save();

    // In a real app, this would integrate with a payment processor
    // For now, we'll return a mock payment URL
    const paymentUrl = `https://payment-processor.example.com/pay/${payment.transactionId}`;

    return NextResponse.json({
      success: true,
      paymentUrl,
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
