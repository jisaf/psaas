// src/app/api/email/inbound/route.ts
import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import * as chrono from 'chrono-node';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function POST(request: Request) {
  const formData = await request.formData();
  const sender = formData.get('sender') as string || formData.get('from') as string;
  const text = (formData.get('text') as string).toLowerCase().trim();

  // The 'from' field can sometimes be in the format "Name <email@example.com>"
  // We just want the email address
  const fromEmail = sender.match(/<(.*)>/)?.[1] || sender;


  const username = await kv.get(`email:${fromEmail}`);

  if (!username) {
    console.error(`User not found for email: ${fromEmail}`);
    return new Response('User not found', { status: 404 });
  }

  const user: any = await kv.get(`user:${username}`);

  if (!user) {
    console.error(`User data not found for username: ${username}`);
    return new Response('User data not found', { status: 404 });
  }

  const parsedDate = chrono.parseDate(text);
  const eventTime = parsedDate || new Date();

  if (text.includes('labor started') && user.status === 'yes') {
    await kv.set(`user:${username}`, { ...user, status: 'in progress', laborStart: eventTime });

    const msg = {
      to: fromEmail,
      from: process.env.FROM_EMAIL || '',
      subject: 'Status Updated: In Progress',
      html: `
        <p>Hi ${username},</p>
        <p>Your status has been updated to <strong>in progress</strong> as of ${eventTime.toLocaleString()}.</p>
        <p>To update your status to "born", reply to this email with "born" or a specific time.</p>
      `,
    };
    await sgMail.send(msg);

  } else if (text.includes('born') && (user.status === 'yes' || user.status === 'in progress')) {
    await kv.set(`user:${username}`, { ...user, status: 'no', born: eventTime });

    const msg = {
      to: fromEmail,
      from: process.env.FROM_EMAIL || '',
      subject: 'Congratulations!',
      html: `
        <p>Hi ${username},</p>
        <p>Congratulations on the new arrival! We've recorded the birth time as ${eventTime.toLocaleString()}.</p>
      `,
    };
    await sgMail.send(msg);
  }

  return new Response('OK', { status: 200 });
}
