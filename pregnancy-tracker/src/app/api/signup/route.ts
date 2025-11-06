// src/app/api/signup/route.ts
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { username, email, color } = await request.json();

    if (!username || !email || !color) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userExists = await kv.exists(`user:${username}`);

    if (userExists) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    const emailExists = await kv.get(`email:${email}`);
    if (emailExists) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    await kv.set(`user:${username}`, { email, color, status: 'yes' });
    await kv.set(`email:${email}`, username);

    const msg = {
      to: email,
      from: process.env.FROM_EMAIL || '',
      subject: 'Welcome to the Pregnancy Tracker!',
      html: `
        <p>Hi ${username},</p>
        <p>Thanks for signing up! You can reply to this email to update your status.</p>
        <p>Current status: <strong>yes</strong></p>
        <p>To update your status, reply with:</p>
        <ul>
          <li>"labor started" (or a specific time) to set your status to "in progress"</li>
        </ul>
      `,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('SendGrid Error:', JSON.stringify(error));
      // We don't block the user, but we should be aware of the error
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Signup API Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred. Please check the server logs.' }, { status: 500 });
  }
}
