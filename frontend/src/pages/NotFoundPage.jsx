import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div>
        <p className="text-8xl mb-4">⊙</p>
        <h1 className="text-3xl font-bold mb-2">404 — Lost in orbit</h1>
        <p className="text-gray-500 mb-6">This page doesn't exist or has drifted away.</p>
        <Link to="/" className="btn-primary">Back to home</Link>
      </div>
    </div>
  );
}
