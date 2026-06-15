import SiteNav from '@/components/layout/SiteNav';
import GalleryClient from '@/components/gallery/GalleryClient';
import { getAllMessages } from '@/lib/getArchiveData';
import { getKind, getMediaUrl, getThumbnailUrl } from '@/lib/message';
import { getManifest } from '@/lib/getManifest';
import { getArtistNicknameByDate } from '@/lib/profile';

export default async function GalleryPage() {
  const manifest = await getManifest();
  const messages = await getAllMessages();

  const items = messages
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
        artistName: getArtistNicknameByDate(manifest.profile, msg.createdAt),
        runningTime: msg.runningTime,
        chatHref: `/chat/${date}#msg-${msg.id}`,
      };
    })
    .filter((item) => item.url);

  return (
    <main className="page">
      <div className="mobileFrame">
        <SiteNav />

        <section className="pageInner">
          <h1 className="pageTitle">갤러리</h1>
          <GalleryClient items={items} />
        </section>
      </div>
    </main>
  );
}