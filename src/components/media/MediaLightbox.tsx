'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Download, X } from 'lucide-react';

export type LightboxItem = {
  id: string;
  kind: string;
  url: string;
  thumb?: string;
  createdAt?: string;
  artistName?: string;
  runningTime?: number | string | null;
  chatHref?: string;
};

export default function MediaLightbox({
  items,
  initialIndex,
  onClose,
}: {
  items: LightboxItem[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [imageLoaded, setImageLoaded] = useState(false);
  const touchStartX = useRef(0);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  const item = items[index];

  function getDownloadName(target: LightboxItem) {
    const rawName = target.url.split('/').pop()?.split('?')[0];

    if (rawName) return decodeURIComponent(rawName);

    const fallbackExt = target.kind === 'video' ? 'mp4' : 'jpg';
    return `media-${target.id}.${fallbackExt}`;
  }

  async function downloadCurrentItem() {
    if (!item?.url) return;

    try {
      const response = await fetch(item.url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = objectUrl;
      anchor.download = getDownloadName(item);
      anchor.rel = 'noopener';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 1000);
    } catch {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  }

  useEffect(() => {
    setImageLoaded(false);
  }, [item?.id]);

  const dateText = useMemo(() => {
    if (!item?.createdAt) return '';

    const d = new Date(item.createdAt);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');

    const isPM = d.getHours() >= 12;
    let h = d.getHours() % 12;
    if (h === 0) h = 12;

    const min = String(d.getMinutes()).padStart(2, '0');

    return `${yyyy}/${mm}/${dd} ${isPM ? '오후' : '오전'} ${h}:${min}`;
  }, [item]);

  function prev() {
    setIndex((value) => {
      if (items.length <= 1) return value;
      return (value - 1 + items.length) % items.length;
    });
  }

  function next() {
    setIndex((value) => {
      if (items.length <= 1) return value;
      return (value + 1) % items.length;
    });
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [items.length, onClose]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    const diff = e.changedTouches[0].clientX - touchStartX.current;

    if (diff > 42) prev();
    if (diff < -42) next();
  }

  if (!item) return null;

  return (
    <div className="viewerOverlay">
      <div className="viewerShell">
        <header className="viewerHeader">
          <button
            className="viewerIconBtn"
            type="button"
            onClick={onClose}
            aria-label="닫기"
          >
            <X size={18} strokeWidth={1.8} />
          </button>

          <div className="viewerHeaderActions">
            {item.chatHref && (
              <Link
                className="viewerIconBtn"
                href={item.chatHref}
                onClick={onClose}
                aria-label="채팅에서 보기"
              >
                <ArrowUpRight size={18} strokeWidth={1.8} />
              </Link>
            )}

            <button
              className="viewerIconBtn"
              type="button"
              onClick={downloadCurrentItem}
              aria-label="다운로드"
            >
              <Download size={18} strokeWidth={1.8} />
            </button>
          </div>
        </header>

        <section
          className="viewerBody"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {item.kind === 'video' ? (
            <video
              key={item.id}
              className="viewerObject"
              src={item.url}
              poster={item.thumb}
              controls
              playsInline
            />
          ) : (
            <>
              {!imageLoaded && (
                <div className="viewerInlineLoader" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              )}

              <img
                key={item.id}
                className={`viewerObject ${imageLoaded ? 'isLoaded' : 'isLoading'}`}
                src={item.url}
                alt=""
                onLoad={() => setImageLoaded(true)}
              />
            </>
          )}
        </section>

        <footer className="viewerFooter">
          <strong>{item.artistName || '김채원'}</strong>
          <span>{dateText}</span>
        </footer>
      </div>
    </div>
  );
}