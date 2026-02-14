import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const indexPath = path.join(process.cwd(), 'uploads', 'voices', 'index.json');
    const data = await readFile(indexPath, 'utf-8');
    let voices = JSON.parse(data);
    
    // Sort by newest first
    voices.sort((a: any, b: any) => b.createdAt - a.createdAt);

    // Add ID
    const voicesWithId = voices.map((v: any) => ({
      ...v,
      id: v.url.split('/').pop()
    }));

    return NextResponse.json(voicesWithId);
  } catch (error) {
    return NextResponse.json([]);
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

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), 'uploads', 'voices');
    await mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const filename = `${timestamp}-${safeName}`;
    const filePath = path.join(uploadDir, filename);
    
    await writeFile(filePath, buffer);

    const url = `/api/file/voices/${filename}`;
    
    // Update index.json
    const indexPath = path.join(uploadDir, 'index.json');
    let index = [];
    try {
      const data = await readFile(indexPath, 'utf-8');
      index = JSON.parse(data);
    } catch (e) {
      // If file doesn't exist or is invalid, start with empty array
    }

    index.push({
      url,
      createdAt: timestamp,
      title: safeName
    });

    await writeFile(indexPath, JSON.stringify(index, null, 2));

    return NextResponse.json({ ok: true, url, id: filename });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
