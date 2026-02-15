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
      console.log('DELETE HIT /api/memories/[id]', id);
    }
    
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing ID' }, { status: 400 });
    }

    // Delete Cloudinary resource by public_id
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('Deleting memory from Cloudinary', { public_id: id, resource_type: 'image' });
    }
    const destroyRes = await cloudinary.uploader.destroy(id);
    if (destroyRes.result !== 'ok' && destroyRes.result !== 'not found') {
      return NextResponse.json({ ok: false, error: 'Delete failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
