import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6">Welcome to the Pregnancy Tracker</h1>
        <p className="mb-6">Create an account to start tracking your pregnancy status and share it with your friends and family.</p>
        <Link href="/signup">
          <a className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none">
            Get Started
          </a>
        </Link>
      </div>
    </div>
  );
}
