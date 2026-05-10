export default function Avatar({ user, size = 10, className = '' }) {
  const src = user?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${user?.username || 'user'}`;
  const sizeClass = `w-${size} h-${size}`;
  return (
    <img
      src={src}
      alt={user?.username || 'User'}
      className={`${sizeClass} rounded-full object-cover bg-gray-200 dark:bg-gray-700 flex-shrink-0 ${className}`}
    />
  );
}
