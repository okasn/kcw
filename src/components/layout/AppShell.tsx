import Link from 'next/link';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="appShell">
      <nav className="bottomNav">
        <Link href="/">홈</Link>
        <Link href="/chat">채팅</Link>
        <Link href="/gallery">갤러리</Link>
        <Link href="/voices">음성</Link>
      </nav>
      {children}
    </main>
  );
}
