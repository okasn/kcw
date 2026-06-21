'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircleMore, Images, Voicemail, Search } from 'lucide-react';

const navItems = [
  { href: '/', label: '홈', icon: Home },
  { href: '/search', label: '검색', icon: Search },
  { href: '/chat', label: '채팅', icon: MessageCircleMore },
  { href: '/gallery', label: '갤러리', icon: Images },
  { href: '/voices', label: '음성메시지', icon: Voicemail },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteNav() {
  const pathname = usePathname();

  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    document.documentElement.style.setProperty('--mobile-nav-offset', '76px');

    function handleScroll() {
      const currentScrollY = window.scrollY;
      const scrollDifference = currentScrollY - lastScrollY.current;
      const isMobile = window.matchMedia('(max-width: 699px)').matches;

      if (!isMobile) {
        setIsHidden(false);
        document.documentElement.style.setProperty('--mobile-nav-offset', '20px');
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY < 24) {
        setIsHidden(false);
        document.documentElement.style.setProperty('--mobile-nav-offset', '76px');
      } else if (scrollDifference > 6) {
        setIsHidden(true);
        document.documentElement.style.setProperty('--mobile-nav-offset', '20px');
      } else if (scrollDifference < -6) {
        setIsHidden(false);
        document.documentElement.style.setProperty('--mobile-nav-offset', '76px');
      }

      lastScrollY.current = currentScrollY;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <nav
      className={`siteNav ${isHidden ? 'isHidden' : ''}`}
      aria-label="사이트 메뉴"
      style={{
        transform: isHidden ? 'translateY(calc(100% + 18px))' : 'translateY(0)',
        transition: 'transform 260ms ease',
        willChange: 'transform',
      }}
    >

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