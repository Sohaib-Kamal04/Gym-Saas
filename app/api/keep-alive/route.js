import Redis from 'ioredis';
import { NextResponse } from 'next/server';

const redisUrl = process.env.REDIS_URL || process.env.KV_URL || process.env.UPSTASH_REDIS_REST_URL;
const redis = redisUrl ? new Redis(redisUrl) : null;

export async function GET() {
  try {
    if (!redis) {
      return NextResponse.json({ status: 'Error', message: 'No Redis connection configured' }, { status: 500 });
    }

    const timestamp = new Date().toISOString();
    await redis.set('last_ping', timestamp);

    return NextResponse.json({ status: 'Active', message: 'Database pinged successfully', timestamp });
  } catch (error) {
    console.error('Keep-alive ping failed:', error);
    return NextResponse.json({ status: 'Error', message: 'Database ping failed' }, { status: 500 });
  }
}
