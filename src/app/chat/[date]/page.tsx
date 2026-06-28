import SiteNav from '@/components/layout/SiteNav';
import ChatDateClient from '@/components/chat/ChatDateClient';
import { getAllMessages, getDayGroups } from '@/lib/getArchiveData';
import { getManifest } from '@/lib/getManifest';
import ChatDateNotFound from '@/components/chat/ChatDateNotFound';
import { getKoreanDateKey } from '@/lib/format';

export default async function ChatDatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  const manifest = await getManifest();
  const messages = await getAllMessages();
  const days = await getDayGroups();

  const dayIndex = days.findIndex((day) => day.date === date);
  const day = days[dayIndex];

  if (!day) {
    const sorted = [...days].sort(
      (a, b) => +new Date(a.date) - +new Date(b.date)
    );

    const target = +new Date(date);

    const prevDay = [...sorted]
      .reverse()
      .find((item) => +new Date(item.date) < target);

    const nextDay = sorted.find(
      (item) => +new Date(item.date) > target
    );

    return (
      <main className="page">
        <div className="mobileFrame">
          <ChatDateNotFound
            date={date}
            prevDay={prevDay}
            nextDay={nextDay}
          />
        </div>
      </main>
    );
  }

  const dayMessages = messages
  .filter((msg) => getKoreanDateKey(msg.createdAt) === date)
  .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

  const prevDay = days[dayIndex + 1];
  const nextDay = days[dayIndex - 1];

  return (
    <main className="page">
      <div className="mobileFrame">
        <SiteNav />

        <ChatDateClient
          date={date}
          messages={dayMessages}
          profile={manifest.profile}
          prevDay={prevDay}
          nextDay={nextDay}
        />
      </div>
    </main>
  );
}