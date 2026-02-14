import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic'; // ensure this route is not statically cached by Next.js

export async function GET() {
  try {
    const configPath = path.join(process.cwd(), 'uploads', 'puzzle', 'config.json');
    const data = await readFile(configPath, 'utf-8');
    const config = JSON.parse(data);
    
    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    return new NextResponse('Config not found', { status: 404 });
  }
}
