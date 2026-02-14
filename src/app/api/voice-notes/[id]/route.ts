import { NextResponse } from 'next/server';
import { readFile, writeFile, unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing ID' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'uploads', 'voices');
    const indexPath = path.join(uploadDir, 'index.json');
    const filePath = path.join(uploadDir, id);

    // 1. Update index.json
    let index = [];
    try {
      const data = await readFile(indexPath, 'utf-8');
      index = JSON.parse(data);
    } catch (e) {
      return NextResponse.json({ ok: false, error: 'Index not found' }, { status: 404 });
    }

    // Filter out
    const newIndex = index.filter((item: any) => {
        const itemId = item.url.split('/').pop();
        return itemId !== id;
    });

    if (newIndex.length === index.length) {
       return NextResponse.json({ ok: false, error: 'Item not found' }, { status: 404 });
    }

    await writeFile(indexPath, JSON.stringify(newIndex, null, 2));

    // 2. Delete the file
    try {
      await unlink(filePath);
    } catch (e) {
      console.warn('File deletion failed:', e);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
