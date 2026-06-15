import SiteNav from '@/components/layout/SiteNav';
import VoicesClient from '@/components/voices/VoicesClient';
import { getAllMessages } from '@/lib/getArchiveData';
import { getKind, getMediaUrl } from '@/lib/message';

export default async function VoicesPage() {
  const messages = await getAllMessages();

  const voices = messages
    .filter((msg) => getKind(msg) === 'audio')
    .map((msg) => {
      const date = msg.createdAt.slice(0, 10);

      return {
        id: msg.id,
        createdAt: msg.createdAt,
        runningTime: msg.runningTime,
        url: getMediaUrl(msg),
        chatHref: `/chat/${date}#msg-${msg.id}`,
      };
    })
    .filter((voice) => voice.url);

  return (
    <main className="page">
      <div className="mobileFrame">
        <SiteNav />

        <section className="pageInner">
          <h1 className="pageTitle">음성메시지</h1>
          <VoicesClient voices={voices} />
        </section>
      </div>
    </main>
  );
}