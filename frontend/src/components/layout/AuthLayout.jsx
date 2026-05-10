import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orbit-50 to-white dark:from-gray-950 dark:to-gray-900 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orbit-600 mb-1">⊙ Orbit</h1>
          <p className="text-gray-500 text-sm">Where your world connects</p>
        </div>
        <div className="card p-6 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
