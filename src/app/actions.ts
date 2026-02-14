'use server';

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const MEMORIES_DIR = path.join(PUBLIC_DIR, 'memories');
const VOICES_DIR = path.join(PUBLIC_DIR, 'voices');

// Ensure directories exist
async function ensureDirs() {
  try { await fs.mkdir(MEMORIES_DIR, { recursive: true }); } catch {}
  try { await fs.mkdir(VOICES_DIR, { recursive: true }); } catch {}
}

export async function uploadPuzzleImage(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) return { success: false, error: 'No file provided' };

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(path.join(PUBLIC_DIR, 'puzzle.jpg'), buffer);
    revalidatePath('/puzzle');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Failed to save file' };
  }
}

export async function uploadMemory(formData: FormData) {
  await ensureDirs();
  const files = formData.getAll('files') as File[];
  if (!files.length) return { success: false, error: 'No files provided' };

  try {
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      await fs.writeFile(path.join(MEMORIES_DIR, filename), buffer);
    }
    revalidatePath('/memories');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Failed to save files' };
  }
}

export async function uploadVoice(formData: FormData) {
  await ensureDirs();
  const file = formData.get('file') as File;
  if (!file) return { success: false, error: 'No file provided' };

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    await fs.writeFile(path.join(VOICES_DIR, filename), buffer);
    revalidatePath('/voice');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Failed to save file' };
  }
}

export async function getMemories() {
  await ensureDirs();
  try {
    const files = await fs.readdir(MEMORIES_DIR);
    return files
      .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
      .map(f => `/memories/${f}`);
  } catch (error) {
    return [];
  }
}

export async function getVoices() {
  await ensureDirs();
  try {
    const files = await fs.readdir(VOICES_DIR);
    return files
      .filter(f => /\.(mp3|wav|ogg|m4a)$/i.test(f))
      .map(f => ({ name: f, url: `/voices/${f}` }));
  } catch (error) {
    return [];
  }
}

export async function checkPuzzleImageExists() {
    try {
        await fs.access(path.join(PUBLIC_DIR, 'puzzle.jpg'));
        return true;
    } catch {
        return false;
    }
}
