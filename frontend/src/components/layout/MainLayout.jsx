import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, Film, MessageCircle, Bell, Settings, LogOut, PlusSquare, Shield, Sun, Moon } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useNotifStore from '../../store/notifStore';
import useTheme from '../../hooks/useTheme';
import useSocket from '../../hooks/useSocket';

const NAV = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/reels', icon: Film, label: 'Reels' },
  { to: '/chat', icon: MessageCircle, label: 'Messages' },
  { to: '/notifications', icon: Bell, label: 'Notifications', badge: true },
];

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const { unreadCount, increment } = useNotifStore();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  useSocket('notification', () => increment());

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex-col px-3 py-6 hidden lg:flex">
        <div className="px-3 mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-orbit-600">⊙ Orbit</h1>
          <button onClick={toggle} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map(({ to, icon: Icon, label, badge }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative ${isActive ? 'bg-orbit-50 dark:bg-orbit-900/30 text-orbit-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`
              }>
              <Icon size={20} />
              {label}
              {badge && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
          <button onClick={() => navigate('/post/new')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <PlusSquare size={20} />Create
          </button>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-orbit-50 dark:bg-orbit-900/30 text-orbit-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <Shield size={20} />Admin
            </NavLink>
          )}
        </nav>
        <div className="space-y-1">
          <NavLink to={`/${user?.username}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <img src={user?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${user?.username}`}
              alt="" className="w-6 h-6 rounded-full object-cover" />
            Profile
          </NavLink>
          <NavLink to="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Settings size={20} />Settings
          </NavLink>
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut size={20} />Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-h-screen pb-20 lg:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-around py-2 z-30">
        {NAV.map(({ to, icon: Icon, badge }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => `relative p-2 rounded-xl ${isActive ? 'text-orbit-600' : 'text-gray-500'}`}>
            <Icon size={22} />
            {badge && unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
        <NavLink to={`/${user?.username}`} className={({ isActive }) => `p-2 rounded-xl ${isActive ? 'text-orbit-600' : 'text-gray-500'}`}>
          <img src={user?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${user?.username}`}
            className="w-6 h-6 rounded-full object-cover" />
        </NavLink>
      </nav>
    </div>
  );
}
