import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
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

    return NextResponse.json(uniqueMemories);
  } catch (error) {
    // If index doesn't exist yet, return empty array
    return NextResponse.json([]);
  }
}
