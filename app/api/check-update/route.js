import { NextResponse } from 'next/server';

/**
 * Next.js API route to handle update version checking.
 * Pings from the GymFlow desktop application launcher.
 * 
 * GET /api/check-update
 */
export async function GET(request) {
  try {
    // Return the latest available version and its direct download URL
    return NextResponse.json({
      version: '1.0.2',
      downloadUrl: 'https://github.com/Sohaib-Kamal04/Gym-Saas/releases/download/v1.0.2/GymFlow.exe'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
