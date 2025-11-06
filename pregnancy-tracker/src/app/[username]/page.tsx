// src/app/[username]/page.tsx
import { kv } from '@vercel/kv';
import { notFound } from 'next/navigation';
import StatusDisplay from './StatusDisplay';

type Props = {
  params: { username: string };
};

export default async function UserPage({ params }: Props) {
  const { username } = params;
  const user: any = await kv.get(`user:${username}`);

  if (!user) {
    notFound();
  }

  return (
    <div style={{ backgroundColor: user.color }} className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Is {username} still pregnant?</h1>
        <StatusDisplay status={user.status} laborStart={user.laborStart} born={user.born} />
      </div>
    </div>
  );
}
