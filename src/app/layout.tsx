import type { Metadata } from 'next';
import '@/styles/global.css';
import '@/styles/home.css';
import '@/styles/chat.css';
import '@/styles/gallery.css';
import '@/styles/audio.css';
import '@/styles/search.css';
import '@/styles/media.css';
import '@/styles/setting.css';


export const metadata: Metadata = {
  metadataBase: new URL("https://www.kcws21.kr"),

  title: "💖💚",
  description: "트리플에스 김채원 프롬 아카이브",

  openGraph: {
    title: "💖💚",
    description: "트리플에스 김채원 프롬 아카이브",
    type: "website",
    url: "https://www.kcws21.kr",
    images: ["/og.jpg"],
  },

  twitter: {
    card: "summary_large_image",
    site: "@pupzei",
    title: "💖💚",
    description: "트리플에스 김채원 프롬 아카이브",
    images: ["/og.jpg"],
  },

  icons: {
    icon: [
      {
        url: encodeURI(
          `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍓</text></svg>`
        ),
      },
    ],
  },

  alternates: {
    canonical: "https://www.kcws21.kr",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}