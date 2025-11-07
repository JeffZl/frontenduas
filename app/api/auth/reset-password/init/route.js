import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectToDB } from '@/lib/mongodb';

export async function POST(request) {
  try {
    await connectToDB();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: 'Email tidak ditemukan' },
        { status: 404 }
      );
    }

    // Return success (we don't reveal if email exists or not for security)
    return NextResponse.json({ 
      message: 'Jika email terdaftar, instruksi akan dikirim' 
    });

  } catch (error) {
    console.error('Error in reset password init:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}