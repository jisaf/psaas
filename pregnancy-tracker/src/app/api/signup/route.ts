// src/app/api/signup/route.ts
import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import clientPromise from '@/lib/mongodb';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { username, email, color } = await request.json();

    if (!username || !email || !color) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const users = db.collection('users');

    const existingUser = await users.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      if (existingUser.username === username) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
      }
      if (existingUser.email === email) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
      }
    }

    await users.insertOne({
      username,
      email,
      color,
      status: 'yes',
      createdAt: new Date(),
    });

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
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Signup API Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred. Please check the server logs.' }, { status: 500 });
  }
}
