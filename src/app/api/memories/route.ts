import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const indexPath = path.join(process.cwd(), 'uploads', 'memories', 'index.json');
    const data = await readFile(indexPath, 'utf-8');
    let memories = JSON.parse(data);
    
    // Deduplicate by URL
    const uniqueMemories = Array.from(new Map(memories.map((m: any) => [m.url, m])).values());
    
    // Sort by newest first
    uniqueMemories.sort((a: any, b: any) => b.createdAt - a.createdAt);

    // Add ID to each memory (filename from URL) if not present
    // Assuming url is like /api/file/memories/filename
    const memoriesWithId = uniqueMemories.map((m: any) => ({
      ...m,
      id: m.url.split('/').pop()
    }));

    return NextResponse.json(memoriesWithId);
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

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ ok: false, error: 'Invalid file type. Must be an image.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), 'uploads', 'memories');
    await mkdir(uploadDir, { recursive: true });

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const filename = `${timestamp}-${safeName}`;
    const filePath = path.join(uploadDir, filename);
    
    await writeFile(filePath, buffer);

    const url = `/api/file/memories/${filename}`;
    
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
      caption: ''
    });

    await writeFile(indexPath, JSON.stringify(index, null, 2));

    return NextResponse.json({ ok: true, url, id: filename });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
