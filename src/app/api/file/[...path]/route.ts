import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  // Initialize variables for error scope
  let absPath = '';
  // Await params as it is a Promise in Next.js 15+
  const resolvedParams = await params;
  const segments = resolvedParams.path || [];

  try {
    console.log("API FILE segments:", segments);
    console.log("CWD:", process.cwd());

    // Security check: validate each segment
    for (const segment of segments) {
      if (segment.includes('..') || segment.startsWith('.')) {
        console.error(`Invalid path segment detected: ${segment}`);
        return new NextResponse('Access Denied', { status: 403 });
      }
    }

    const baseDir = path.join(process.cwd(), 'uploads');
    absPath = path.join(baseDir, ...segments);
    
    console.log("API FILE absPath:", absPath);

    // Ensure path traversal protection
    if (!absPath.startsWith(baseDir)) {
       console.error(`Path traversal attempt: ${absPath}`);
       return new NextResponse('Access Denied', { status: 403 });
    }

    // Check if file exists
    try {
      await fs.access(absPath);
    } catch (e) {
      console.error(`File not found: ${absPath}`);
      return new NextResponse(`File Not Found: ${absPath}`, { status: 404 });
    }

    // Determine content type
    const ext = path.extname(absPath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
      case '.mp3':
        contentType = 'audio/mpeg';
        break;
      case '.wav':
        contentType = 'audio/wav';
        break;
      case '.m4a':
        contentType = 'audio/mp4';
        break;
      case '.ogg':
        contentType = 'audio/ogg';
        break;
    }

    const fileBuffer = await fs.readFile(absPath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error("API FILE ERROR", error);
    return new NextResponse(
      "API FILE ERROR:\n" + String(error) + "\nPATH:\n" + absPath, 
      { status: 500 }
    );
  }
}
