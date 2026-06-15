'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircleMore, Images, Voicemail, Settings, Search, GalleryVerticalEnd } from 'lucide-react';

const navItems = [
  { href: '/', label: '홈', icon: Home },
  { href: '/search', label: '검색', icon: Search },
  { href: '/chat', label: '채팅', icon: MessageCircleMore },
  { href: '/gallery', label: '갤러리', icon: Images },
  { href: '/voices', label: '음성메시지', icon: Voicemail },
  { href: '/setting', label: '설정', icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="siteNav" aria-label="사이트 메뉴">

      <div className="siteNavItems">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`siteNavItem ${active ? 'isActive' : ''}`}
              aria-label={item.label}
            >
              <Icon />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}