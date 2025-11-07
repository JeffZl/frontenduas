// app/api/auth/sign-up/route.js
import { NextResponse } from 'next/server';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { connectToDB } from '@/lib/mongodb'; // You have this file

export async function POST(request) {
  try {
    await connectToDB(); // Fixed: use connectToDB instead of dbConnect

    const { handle, email, password, name, secretWord1, secretWord2 } = await request.json();

    console.log('Received sign-up data:', { handle, email, name, secretWord1, secretWord2 });

    // Validate required fields
    if (!handle || !email || !password || !name || !secretWord1 || !secretWord2) {
      return NextResponse.json(
        { error: 'All fields are required including secret words' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { handle: handle.toLowerCase() }]
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user with secret words
    const user = new User({
      handle: handle.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      secretWord1: secretWord1.toLowerCase().trim(),
      secretWord2: secretWord2.toLowerCase().trim(),
    });

    await user.save();
    console.log('User created successfully:', user.email);

    // Return user without password
    const userResponse = {
      id: user._id,
      handle: user.handle,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    };

    return NextResponse.json(
      { message: 'User created successfully', user: userResponse },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user: ' + error.message },
      { status: 500 }
    );
  }
}