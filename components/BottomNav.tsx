'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Upload, Settings } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/upload', label: 'Upload', icon: Upload },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-mobile bg-white border-t border-gray-200 pb-safe">
      <div className="flex items-center justify-around">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 py-3 min-h-[56px] gap-1 text-xs font-medium transition-colors ${
                active ? 'text-primary' : 'text-gray-500'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
