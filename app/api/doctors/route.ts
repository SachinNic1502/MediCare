import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Doctor } from '@/models/Doctor';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get('specialty');
    const location = searchParams.get('location');
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    
    let query: any = { isActive: true };
    
    if (specialty) {
      query.specialty = new RegExp(specialty, 'i');
    }
    
    if (location) {
      query.location = new RegExp(location, 'i');
    }
    
    const skip = (page - 1) * limit;
    
    const doctors = await Doctor.find(query)
      .select('-__v')
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Doctor.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: doctors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    const doctor = new Doctor(body);
    await doctor.save();
    
    return NextResponse.json({
      success: true,
      data: doctor,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating doctor:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Doctor with this email already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create doctor' },
      { status: 500 }
    );
  }
}
