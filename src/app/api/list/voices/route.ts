import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const indexPath = path.join(process.cwd(), 'uploads', 'voices', 'index.json');
    const data = await readFile(indexPath, 'utf-8');
    const voices = JSON.parse(data);
    return NextResponse.json(voices);
  } catch (error) {
    // If index doesn't exist yet, return empty array
    return NextResponse.json([]);
  }
}
