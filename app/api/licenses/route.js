import Redis from 'ioredis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DB_KEY = 'gymflow_licenses';

// Fallback to REDIS_URL or KV_URL (Vercel standard)
const redisUrl = process.env.REDIS_URL || process.env.KV_URL || process.env.UPSTASH_REDIS_REST_URL;
const redis = redisUrl ? new Redis(redisUrl) : null;

export async function GET() {
  try {
    if (!redis) return NextResponse.json({ error: 'Database connection not initialized' }, { status: 500 });
    const data = await redis.get(DB_KEY);
    const licenses = data ? JSON.parse(data) : [];
    return NextResponse.json(licenses);
  } catch (error) {
    console.error('Redis GET Error:', error);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!redis) throw new Error("No Redis connection string found");
    
    const newLicense = await request.json();
    const data = await redis.get(DB_KEY);
    let licenses = data ? JSON.parse(data) : [];

    if (!Array.isArray(licenses)) licenses = [];

    const existingIndex = licenses.findIndex(
      (l) => l.machineId.toUpperCase() === newLicense.machineId.toUpperCase()
    );

    if (existingIndex >= 0) {
      licenses[existingIndex] = {
        ...licenses[existingIndex],
        ...newLicense,
        machineId: newLicense.machineId.toUpperCase()
      };
    } else {
      licenses.push({
        ...newLicense,
        machineId: newLicense.machineId.toUpperCase()
      });
    }

    await redis.set(DB_KEY, JSON.stringify(licenses));

    return NextResponse.json({ success: true, licenses });
  } catch (error) {
    console.error('Redis POST Error:', error);
    return NextResponse.json({ error: 'Failed to save to database' }, { status: 500 });
  }
}
export async function DELETE(request) {
  try {
    if (!redis) throw new Error("No Redis connection string found");
    
    const { searchParams } = new URL(request.url);
    const machineId = searchParams.get('machineId');
    
    if (!machineId) {
      return NextResponse.json({ error: 'machineId is required' }, { status: 400 });
    }

    const data = await redis.get(DB_KEY);
    let licenses = data ? JSON.parse(data) : [];

    if (!Array.isArray(licenses)) licenses = [];

    const existingIndex = licenses.findIndex(
      (l) => l.machineId.toUpperCase() === machineId.toUpperCase()
    );

    if (existingIndex >= 0) {
      licenses.splice(existingIndex, 1);
      await redis.set(DB_KEY, JSON.stringify(licenses));
      return NextResponse.json({ success: true, message: 'Deleted successfully' });
    } else {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Redis DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete from database' }, { status: 500 });
  }
}
