// app/api/auth/reset-password/verify/route.js
import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectToDB } from '@/lib/mongodb';

export async function POST(request) {
  try {
    await connectToDB();

    const { email, secretWord1, secretWord2 } = await request.json();

    console.log('🔧 Reset Password Verify - Received:', { email, secretWord1, secretWord2 });

    if (!email || !secretWord1 || !secretWord2) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Find user and verify secret words
    const user = await User.findOne({ 
      email: email.toLowerCase()
    });

    console.log('🔍 User found for verification:', user ? 'Yes' : 'No');
    
    if (user) {
      console.log('📝 Stored secret words:', {
        stored1: user.secretWord1,
        stored2: user.secretWord2,
        provided1: secretWord1.toLowerCase().trim(),
        provided2: secretWord2.toLowerCase().trim()
      });
    }

    const verifiedUser = await User.findOne({ 
      email: email.toLowerCase(),
      secretWord1: secretWord1.toLowerCase().trim(),
      secretWord2: secretWord2.toLowerCase().trim()
    });

    console.log('✅ User verification result:', verifiedUser ? 'Success' : 'Failed');

    if (!verifiedUser) {
      return NextResponse.json(
        { error: 'Kata rahasia tidak sesuai' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      message: 'Kata rahasia valid' 
    });

  } catch (error) {
    console.error('Error in reset password verify:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}