import Link from 'next/link';
import { ArrowLeft, Home, MessageCircleMore } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="page">
      <div className="mobileFrame">
        <section className="notFoundPage">
          <div className="notFoundTop">
            <Link href="/" className="notFoundBack" aria-label="홈으로 이동">
              <ArrowLeft size={17} strokeWidth={1.8} />
            </Link>
          </div>

          <div className="notFoundCard">
            <h1>페이지를 찾을 수 없어요</h1>

            <p>
              주소가 잘못되었거나<br />
              더 이상 남아있지 않은 페이지예요.
            </p>

            <div className="notFoundLinks">
              <Link href="/">
                <Home size={14} strokeWidth={1.8} />
                홈으로
              </Link>

              <Link href="/chat">
                <MessageCircleMore size={14} strokeWidth={1.8} />
                채팅 보기
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}