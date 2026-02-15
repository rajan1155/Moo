import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.time('voices:list');
    }
    // List resources from Cloudinary 'voices' folder
    // Note: resource_type 'video' is used for audio files
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'voices/',
      resource_type: 'video', 
      max_results: 200,
      context: true,
      sort_by: 'created_at',
      direction: 'desc'
    });

    const voices = result.resources.map((resource: any) => ({
      id: resource.public_id,
      url: resource.secure_url,
      createdAt: new Date(resource.created_at).getTime(),
      title: resource.context?.custom?.title || resource.public_id
    }));

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.timeEnd('voices:list');
    }
    return NextResponse.json(voices, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  } catch (error) {
    console.error('List voices error:', error);
    return NextResponse.json([], { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  }
}
