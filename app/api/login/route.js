import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { password } = await request.json();
    
    // Retrieve passcode from environment variables, fallback to 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

    if (password === adminPassword) {
      // Return a simple mock token indicating successful validation
      return NextResponse.json({ success: true, token: 'authenticated_gymflow_session' });
    } else {
      return NextResponse.json({ error: 'Invalid admin passcode. Please try again.' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json({ error: 'Server authentication error.' }, { status: 500 });
  }
}
