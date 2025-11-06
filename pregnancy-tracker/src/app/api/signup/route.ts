// src/app/api/signup/route.ts
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function POST(request: Request) {
  console.log('Signup request received');
  const { username, email, color } = await request.json();

  if (!username || !email || !color) {
    return new Response('Missing required fields', { status: 400 });
  }

  const userExists = await kv.exists(`user:${username}`);

  if (userExists) {
    return new Response('Username already taken', { status: 409 });
  }

  // Check if email is already in use
  const emailExists = await kv.get(`email:${email}`);
  if (emailExists) {
    return new Response('Email already in use', { status: 409 });
  }

  await kv.set(`user:${username}`, { email, color, status: 'yes' });
  await kv.set(`email:${email}`, username);

  const msg = {
    to: email,
    from: process.env.FROM_EMAIL || '', // Use an environment variable for the from email
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
    console.error(JSON.stringify(error));
    // We don't want to block the user from signing up if the email fails
  }

  return NextResponse.json({ success: true });
}
