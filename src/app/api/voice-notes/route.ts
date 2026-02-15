import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'voices/',
      resource_type: 'video',
      max_results: 500,
      sort_by: 'created_at',
      direction: 'desc',
      context: true,
    });
    const voices = result.resources.map((r: any) => ({
      id: r.public_id,
      url: r.secure_url,
      title: r.context?.custom?.title || path.parse(r.public_id).name,
      createdAt: new Date(r.created_at).getTime(),
    }));
    return NextResponse.json(voices, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Voices GET error:', error);
    return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ ok: false, error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.type.startsWith('audio/')) {
      return NextResponse.json({ ok: false, error: 'Invalid file type. Must be audio.' }, { status: 400 });
    }

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const publicId = `voices/${timestamp}-${path.parse(safeName).name}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'voices', public_id: publicId, resource_type: 'video' },
        (err, res) => (err ? reject(err) : resolve(res))
      );
      uploadStream.end(buffer);
    });
    return NextResponse.json({ ok: true, url: result.secure_url, id: result.public_id }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
