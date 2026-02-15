import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ ok: false, error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ ok: false, error: 'Invalid file type. Must be an image.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '') || 'puzzle';

    // Upload to Cloudinary using a Promise wrapper around upload_stream
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'puzzle',
          // We can let Cloudinary generate ID or use timestamp to keep history
          public_id: `${Date.now()}-${path.parse(safeName).name}`, 
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('Puzzle upload saved', result.secure_url);
    }
    return NextResponse.json({ ok: true, url: result.secure_url, updatedAt: Date.now() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
