import SiteNav from '@/components/layout/SiteNav';
import ChatDayGridClient from '@/components/chat/ChatDayGridClient';
import { getDayGroups } from '@/lib/getArchiveData';

export default async function ChatPage() {
  const days = await getDayGroups();

  return (
    <main className="page">
      <div className="mobileFrame">
        <SiteNav />

        <section className="pageInner">
          <h1 className="pageTitle">채팅</h1>
          <ChatDayGridClient days={days} />
        </section>
      </div>
    </main>
  );
}