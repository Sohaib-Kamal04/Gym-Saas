import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

const DB_KEY = 'gymflow_licenses';

export async function GET() {
  try {
    const licenses = (await kv.get(DB_KEY)) || [];
    return NextResponse.json(licenses);
  } catch (error) {
    console.error('KV GET Error:', error);
    // Fallback to empty array if KV isn't configured during local build testing
    return NextResponse.json([]);
  }
}

export async function POST(request) {
  try {
    const newLicense = await request.json();
    let licenses = (await kv.get(DB_KEY)) || [];

    // Ensure it's an array
    if (!Array.isArray(licenses)) {
      licenses = [];
    }

    // Check if machineId already exists
    const existingIndex = licenses.findIndex(
      (l) => l.machineId.toUpperCase() === newLicense.machineId.toUpperCase()
    );

    if (existingIndex >= 0) {
      // Update existing
      licenses[existingIndex] = {
        ...licenses[existingIndex],
        ...newLicense,
        machineId: newLicense.machineId.toUpperCase()
      };
    } else {
      // Add new
      licenses.push({
        ...newLicense,
        machineId: newLicense.machineId.toUpperCase()
      });
    }

    // Save back to KV
    await kv.set(DB_KEY, licenses);

    return NextResponse.json({ success: true, licenses });
  } catch (error) {
    console.error('KV POST Error:', error);
    return NextResponse.json({ error: 'Failed to save to database' }, { status: 500 });
  }
}
