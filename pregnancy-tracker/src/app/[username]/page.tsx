// src/app/[username]/page.tsx
import { notFound } from 'next/navigation';
import StatusDisplay from './StatusDisplay';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

type Props = {
  params: { username: string };
};

export default async function UserPage({ params }: Props) {
  const { username } = params;

  const client = await clientPromise;
  const db = client.db();
  const user = await db.collection('users').findOne({ username });

  console.log('User from DB:', user);

  if (!user) {
    notFound();
  }

  // The MongoDB driver returns dates as Date objects, but they need to be
  // serialized to be passed from a Server Component to a Client Component.
  const laborStart = user.laborStart ? user.laborStart.toISOString() : undefined;
  const born = user.born ? user.born.toISOString() : undefined;

  return (
    <div style={{ backgroundColor: user.color }} className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Is {username} still pregnant?</h1>
        <StatusDisplay status={user.status} laborStart={laborStart} born={born} />
      </div>
    </div>
  );
}
