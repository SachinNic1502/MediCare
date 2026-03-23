import { Doctor } from '@/models/Doctor';
import connectDB from '@/lib/mongodb';

export async function getDoctors(limit = 3) {
  try {
    await connectDB();
    const doctors = await Doctor.find({ isActive: true })
      .select('-__v')
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit)
      .lean();
    
    return JSON.parse(JSON.stringify(doctors));
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }
}
