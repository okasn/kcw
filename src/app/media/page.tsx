import SiteNav from '@/components/layout/SiteNav';
import MediaClient from '@/components/media/MediaClient';

import { getAllMessages } from '@/lib/getArchiveData';
import { getKind, getMediaUrl, getThumbnailUrl } from '@/lib/message';
import { getManifest } from '@/lib/getManifest';
import { getArtistNicknameByDate } from '@/lib/profile';

export default async function MediaPage() {
  const manifest = await getManifest();
  const messages = await getAllMessages();

  const galleryItems = messages
    .filter((msg) => {
      const kind = getKind(msg);
      return kind === 'image' || kind === 'video';
    })
    .map((msg) => {
      const date = msg.createdAt.slice(0, 10);

      return {
        id: msg.id,
        kind: getKind(msg),
        url: getMediaUrl(msg),
        thumb: getThumbnailUrl(msg),
        createdAt: msg.createdAt,
        artistName: getArtistNicknameByDate(
          manifest.profile,
          msg.createdAt
        ),
        runningTime: msg.runningTime,
        chatHref: `/chat/${date}#msg-${msg.id}`,
      };
    })
    .filter((item) => item.url);

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
          <h1 className="pageTitle">미디어</h1>

          <MediaClient
            galleryItems={galleryItems}
            voices={voices}
          />
        </section>
      </div>
    </main>
  );
}