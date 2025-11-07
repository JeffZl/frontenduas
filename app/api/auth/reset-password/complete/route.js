// app/api/auth/reset-password/complete/route.js
import { NextResponse } from 'next/server';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { connectToDB } from '@/lib/mongodb';

export async function POST(request) {
  try {
    await connectToDB();

    const { email, newPassword } = await request.json();

    console.log('🔧 Reset Password Complete - Received:', { email, newPasswordLength: newPassword?.length });

    if (!email || !newPassword) {
      console.log('❌ Missing email or newPassword');
      return NextResponse.json(
        { error: 'Email and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      console.log('❌ Password too short');
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('🔍 User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('❌ User not found with email:', email);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash new password
    console.log('🔑 Hashing new password...');
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    console.log('💾 Updating user password...');
    user.password = hashedPassword;
    await user.save();
    
    console.log('✅ Password updated successfully for user:', email);

    return NextResponse.json({ 
      message: 'Password berhasil direset' 
    });

  } catch (error) {
    console.error('❌ Error in reset password complete:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server: ' + error.message },
      { status: 500 }
    );
  }
}