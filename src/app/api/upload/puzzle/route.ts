import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
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

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), 'uploads', 'puzzle');
    
    await mkdir(uploadDir, { recursive: true });
    
    // Use original extension or default to .jpg
    // sanitize filename to be safe but keep extension
    const ext = path.extname(file.name) || '.jpg';
    const originalName = path.basename(file.name, ext);
    const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '') || 'puzzle';
    const fileName = `${safeName}${ext}`;
    
    const filePath = path.join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);

    const fileUrl = `/api/file/puzzle/${fileName}`;
    const timestamp = Date.now();

    // Update config.json
    const config = {
      url: fileUrl,
      updatedAt: timestamp
    };

    await writeFile(
      path.join(uploadDir, 'config.json'),
      JSON.stringify(config, null, 2)
    );

    return NextResponse.json({ ok: true, url: fileUrl, updatedAt: timestamp });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
