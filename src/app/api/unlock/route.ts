import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  
  // Set the cookie with proper attributes
  // secure: process.env.NODE_ENV === 'production' ensures it works on localhost (http)
  response.cookies.set('puzzle_unlocked', 'true', {
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false, // Allow client JS to read it if needed, though middleware handles the check
  });

  return response;
}
