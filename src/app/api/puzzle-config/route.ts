import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export const dynamic = 'force-dynamic'; // ensure this route is not statically cached by Next.js

export async function GET() {
  try {
    // Get the latest image uploaded to 'puzzle' folder
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'puzzle/',
      max_results: 100
    });

    if (result.resources && result.resources.length > 0) {
      const latest = [...result.resources].sort((a: any, b: any) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })[0];
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log('Puzzle config loaded', latest.secure_url);
      }
      return NextResponse.json({
        url: latest.secure_url,
        updatedAt: new Date(latest.created_at).getTime()
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    }

    return new NextResponse('Config not found', { status: 404 });
  } catch (error) {
    console.error('Puzzle config error:', error);
    return new NextResponse('Config not found', { status: 404 });
  }
}
