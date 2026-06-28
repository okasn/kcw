'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUp } from 'lucide-react';
import MessageItem from './MessageItem';
import DateDivider from './DateDivider';
import { getKoreanDateKey } from '@/lib/format';
import type { ChatMessage, Manifest } from '@/lib/types';
import type { DayGroup } from '@/lib/getArchiveData';
import {
  getFallbackMediaUrl,
  getFallbackThumbnailUrl,
  getKind,
  getMediaUrl,
  getThumbnailUrl,
} from '@/lib/message';
import { getArtistNicknameByDate } from '@/lib/profile';
import type { LightboxItem } from '@/components/media/MediaLightbox';

export default function ChatDateClient({
  date,
  messages,
  profile,
  prevDay,
  nextDay,
}: {
  date: string;
  messages: ChatMessage[];
  profile: Manifest['profile'];
  prevDay?: DayGroup;
  nextDay?: DayGroup;
}) {
  const [showTop, setShowTop] = useState(false);
  const [targetMessageId, setTargetMessageId] = useState<string | null>(null);

  const mediaItems = useMemo<LightboxItem[]>(() => {
    return messages
      .filter((msg) => {
        const kind = getKind(msg);
        return kind === 'image' || kind === 'video';
      })
      .map((msg) => {
  const kind = getKind(msg);

  return {
    id: msg.id,
    kind,
    url: getMediaUrl(msg),
    thumb: getThumbnailUrl(msg),
    fallbackUrl: getFallbackMediaUrl(msg),
    fallbackThumb: getFallbackThumbnailUrl(msg),
    createdAt: msg.createdAt,
    artistName: getArtistNicknameByDate(profile, msg.createdAt),
    runningTime: msg.runningTime,
    chatHref: `/chat/${getKoreanDateKey(msg.createdAt)}#msg-${msg.id}`,
  };
})
      .filter((item) => item.url);
  }, [messages, profile]);

  useEffect(() => {
    if (!window.location.hash) return;

    const targetId = window.location.hash.slice(1);
    const messageId = targetId.startsWith('msg-')
      ? targetId.replace('msg-', '')
      : null;

    if (messageId) {
      setTargetMessageId(messageId);

      window.setTimeout(() => {
        setTargetMessageId((current) =>
          current === messageId ? null : current
        );
      }, 2200);
    }

    let attempts = 0;

    const scrollToTarget = () => {
      const el = document.getElementById(targetId);

      if (!el) {
        attempts += 1;

        if (attempts < 30) {
          window.setTimeout(scrollToTarget, 120);
        }

        return;
      }

      el.scrollIntoView({
        behavior: 'auto',
        block: 'center',
      });

      requestAnimationFrame(() => {
        window.setTimeout(() => {
          el.scrollIntoView({
            behavior: 'auto',
            block: 'center',
          });
        }, 350);
      });
    };

    window.setTimeout(scrollToTarget, 80);
  }, [messages]);

  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 360);
    }

    onScroll();
    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <section className="chatDetail">
      <div className="chatScreen">
        <DateDivider iso={date} />

        {messages.map((msg) => {
          const mediaIndex = mediaItems.findIndex((item) => item.id === msg.id);

          return (
            <MessageItem
              key={msg.id}
              msg={msg}
              profile={profile}
              mediaItems={mediaItems}
              mediaIndex={mediaIndex}
              isTarget={targetMessageId === msg.id}
            />
          );
        })}
      </div>

      <nav className="dayNav">
        {prevDay ? (
          <Link href={`/chat/${prevDay.date}`} className="dayNavCard">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" />
            </svg>
            <strong>{prevDay.shortDate}</strong>
          </Link>
        ) : (
          <div />
        )}

        {nextDay ? (
          <Link href={`/chat/${nextDay.date}`} className="dayNavCard next">
            <strong>{nextDay.shortDate}</strong>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        ) : (
          <div />
        )}
      </nav>

      <button
        className={`scrollTopButton ${showTop ? 'isVisible' : ''}`}
        type="button"
        onClick={scrollTop}
        aria-label="맨 위로"
      >
        <ArrowUp size={15} strokeWidth={1.9} />
      </button>
    </section>
  );
}