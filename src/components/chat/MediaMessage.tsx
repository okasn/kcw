'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import {
  getFallbackMediaUrl,
  getFallbackThumbnailUrl,
  getMediaUrl,
  getThumbnailUrl,
} from '@/lib/message';
import { formatDuration, getKoreanDateKey } from '@/lib/format';
import type { ChatMessage } from '@/lib/types';
import MediaLightbox, { type LightboxItem } from '@/components/media/MediaLightbox';

export default function MediaMessage({
  msg,
  kind,
  mediaItems,
  mediaIndex = -1,
}: {
  msg: ChatMessage;
  kind: string;
  mediaItems?: LightboxItem[];
  mediaIndex?: number;
}) {
  const [open, setOpen] = useState(false);

  const url = getMediaUrl(msg);
  const thumb = getThumbnailUrl(msg);
  const fallbackUrl = getFallbackMediaUrl(msg);
  const fallbackThumb = getFallbackThumbnailUrl(msg);

  const [currentUrl, setCurrentUrl] = useState(url);
  const [currentThumb, setCurrentThumb] = useState(thumb || url);

  if (!url) return <div className="textBubble">지원하지 않는 미디어</div>;

  if (kind === 'emoticon') {
    return (
      <img
        className="emoticonImage"
        src={currentUrl}
        alt=""
        onError={() => {
          if (fallbackUrl && currentUrl !== fallbackUrl) {
            setCurrentUrl(fallbackUrl);
          }
        }}
      />
    );
  }

  const fallbackItem: LightboxItem = {
  id: msg.id,
  kind,
  url: currentUrl,
  thumb: currentThumb,
  fallbackUrl,
  fallbackThumb,
  createdAt: msg.createdAt,
  artistName: '김채원',
  runningTime: msg.runningTime,
  chatHref: `/chat/${getKoreanDateKey(msg.createdAt)}#msg-${msg.id}`,
};

  const viewerItems = mediaItems?.length ? mediaItems : [fallbackItem];
  const viewerIndex = mediaIndex >= 0 ? mediaIndex : 0;

  return (
    <>
      <button
        className={`chatMediaButton ${kind === 'video' ? 'isVideo' : ''}`}
        type="button"
        onClick={() => setOpen(true)}
      >
        <img
          className="mediaCard"
          src={currentThumb || currentUrl}
          alt=""
          loading="lazy"
          onError={() => {
            if (fallbackThumb && currentThumb !== fallbackThumb) {
              setCurrentThumb(fallbackThumb);
              return;
            }

            if (fallbackUrl && currentThumb !== fallbackUrl) {
              setCurrentThumb(fallbackUrl);
            }
          }}
        />

        {kind === 'video' && (
          <span className="chatVideoOverlay">
            <span className="chatVideoPlay">
              <Play size={28} fill="currentColor" strokeWidth={0} />
            </span>
            <em>{formatDuration(msg.runningTime)}</em>
          </span>
        )}
      </button>

      {open && (
        <MediaLightbox
          items={viewerItems}
          initialIndex={viewerIndex}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}