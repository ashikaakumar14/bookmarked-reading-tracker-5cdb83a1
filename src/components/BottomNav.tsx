import { Link, useLocation } from 'react-router-dom';
import { Home, Plus, Library } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/add', icon: Plus, label: 'Add', isCenter: true },
  { to: '/lists', icon: Library, label: 'Lists' },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-sm safe-area-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navItems.map(({ to, icon: Icon, label, isCenter }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center gap-0.5 px-4 py-1 text-xs transition-colors',
                isCenter
                  ? 'relative -top-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg'
                  : active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn(isCenter ? 'h-6 w-6' : 'h-5 w-5')} />
              {!isCenter && <span>{label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
