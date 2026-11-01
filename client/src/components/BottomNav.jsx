import { NavLink } from 'react-router-dom';
import { Home, Package, ShoppingBag, TrendingUp, Box } from 'lucide-react';

const navItems = [
  { to: '/',          icon: Home,        label: 'Home'     },
  { to: '/products',  icon: Package,     label: 'Products' },
  { to: '/orders',    icon: ShoppingBag, label: 'Orders'   },
  { to: '/packaging', icon: Box,         label: 'Packing'  },
  { to: '/finance',   icon: TrendingUp,  label: 'Finance'  },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 flex-1 py-2 transition-colors ${
                isActive ? 'text-brand-600' : 'text-gray-400'
              }`
            }
          >
            <Icon size={22} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
