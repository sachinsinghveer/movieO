import connectToMongo from '../../../../lib/connectDB';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToMongo();
    return NextResponse.json({ status: 'Connected', message: 'MongoDB connection established successfully.' });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { status: 'Error', message: 'Failed to connect to MongoDB', error: error.message },
      { status: 500 }
    );
  }
}
