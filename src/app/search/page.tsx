import SiteNav from '@/components/layout/SiteNav';
import SearchClient from '@/components/search/SearchClient';
import { getAllMessages } from '@/lib/getArchiveData';
import { getTextContent } from '@/lib/message';
import { getKoreanDateKey } from '@/lib/format';

function isMediaUrlText(value: string) {
  const text = value.trim();

  if (!/^https?:\/\//i.test(text)) return false;

  return /\.(jpg|jpeg|png|gif|webp|mp4|mov|m4a|mp3|wav|aac)(\?|#|$)/i.test(text);
}

function compactTextParts(parts: Array<string | null | undefined>) {
  return parts
    .map((part) => String(part || '').trim())
    .filter((part) => part && !isMediaUrlText(part))
    .join('\n');
}

export default async function SearchPage() {
  const messages = await getAllMessages();

  const searchableMessages = messages
    .map((msg) => {
      const text = compactTextParts([getTextContent(msg)]);
      const replyText = compactTextParts([
        msg.mentionedMessageContent,
        msg.mentionedMessageTranslatedMessage,
      ]);

      return {
        id: msg.id,
        createdAt: msg.createdAt,
        text,
        replyText,
        searchText: compactTextParts([text, replyText]),
        chatHref: `/chat/${getKoreanDateKey(msg.createdAt)}#msg-${msg.id}`,
      };
    })
    .filter((msg) => msg.searchText.trim());

  return (
    <main className="page">
      <div className="mobileFrame">
        <SiteNav />

        <section className="pageInner">
          <h1 className="pageTitle">검색</h1>
          <SearchClient messages={searchableMessages} />
        </section>
      </div>
    </main>
  );
}