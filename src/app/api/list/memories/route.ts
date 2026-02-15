import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.time('memories:list');
    }
    // List resources from Cloudinary 'memories' folder
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'memories/',
      max_results: 200,
      context: false,
      sort_by: 'created_at',
      direction: 'desc'
    });

    const memories = result.resources.map((resource: any) => ({
      id: resource.public_id,
      url: resource.secure_url,
      createdAt: new Date(resource.created_at).getTime(),
      caption: ''
    }));

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.timeEnd('memories:list');
    }
    return NextResponse.json(memories, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  } catch (error) {
    console.error('List memories error:', error);
    return NextResponse.json([], { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  }
}
