import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('DELETE HIT /api/voice-notes/[id]', id);
    }
    
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing ID' }, { status: 400 });
    }

    // Delete Cloudinary resource by public_id (audio uses resource_type 'video')
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('Deleting voice note from Cloudinary', { public_id: id, resource_type: 'video' });
    }
    const destroyRes = await cloudinary.uploader.destroy(id, { resource_type: 'video' });
    if (destroyRes.result !== 'ok' && destroyRes.result !== 'not found') {
      return NextResponse.json({ ok: false, error: 'Delete failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
