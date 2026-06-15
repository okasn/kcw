import Link from 'next/link';
import type { DayGroup } from '@/lib/getArchiveData';

export default function ChatDateNotFound({
  date,
  prevDay,
  nextDay,
}: {
  date: string;
  prevDay?: DayGroup;
  nextDay?: DayGroup;
}) {
  return (
    <section className="notFoundPage">
      <div className="notFoundTop">
        <Link href="/chat" className="notFoundBack" aria-label="목록으로 이동">
          ←
        </Link>
      </div>

      <div className="notFoundCard">
        <h1>존재하지 않는 날짜예요</h1>

        <p>
          다른 날짜를 확인해 보세요.
        </p>

        <div className="notFoundLinks">
          <Link href="/chat">날짜 목록</Link>

          {prevDay && <Link href={`/chat/${prevDay.date}`}>이전 메시지</Link>}
          {nextDay && <Link href={`/chat/${nextDay.date}`}>다음 메시지</Link>}
        </div>
      </div>
    </section>
  );
}