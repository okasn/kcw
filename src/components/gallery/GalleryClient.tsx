'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { formatDuration } from '@/lib/format';
import MediaLightbox, { type LightboxItem } from '@/components/media/MediaLightbox';
import { ArrowUp, ListFilter, Play } from 'lucide-react';

type MediaType = 'all' | 'image' | 'video';
type SortMode = 'newest' | 'oldest';

const PAGE_SIZE = 60;
const VISIBLE_COUNT_KEY = 'galleryVisibleCount';
const SCROLL_Y_KEY = 'galleryScrollY';
const RESTORE_STATE_KEY = 'galleryRestoreState';

export default function GalleryClient({ items }: { items: LightboxItem[] }) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<MediaType>('all');
  const [sort, setSort] = useState<SortMode>('newest');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showTop, setShowTop] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const savedScrollYRef = useRef<number | null>(null);
  const savedVisibleCountRef = useRef<number | null>(null);

  const filteredItems = useMemo(() => {
    const result =
      selectedType === 'all'
        ? [...items]
        : items.filter((item) => item.kind === selectedType);

    return result.sort((a, b) => {
      const diff = +new Date(a.createdAt || '') - +new Date(b.createdAt || '');
      return sort === 'oldest' ? diff : -diff;
    });
  }, [items, selectedType, sort]);

  const visibleItems = filteredItems.slice(0, visibleCount);

  useEffect(() => {
    const shouldRestoreState = sessionStorage.getItem(RESTORE_STATE_KEY) === 'true';

    if (shouldRestoreState) {
      const savedVisibleCount = sessionStorage.getItem(VISIBLE_COUNT_KEY);
      const savedScrollY = sessionStorage.getItem(SCROLL_Y_KEY);

      if (savedVisibleCount) {
        const nextVisibleCount = Number(savedVisibleCount);

        if (Number.isFinite(nextVisibleCount) && nextVisibleCount > PAGE_SIZE) {
          savedVisibleCountRef.current = nextVisibleCount;
          setVisibleCount(nextVisibleCount);
        }
      }

      if (savedScrollY) {
        const nextScrollY = Number(savedScrollY);

        if (Number.isFinite(nextScrollY) && nextScrollY > 0) {
          savedScrollYRef.current = nextScrollY;
        }
      }
    } else {
      sessionStorage.removeItem(VISIBLE_COUNT_KEY);
      sessionStorage.removeItem(SCROLL_Y_KEY);
    }
  }, []);

  useEffect(() => {
    if (savedScrollYRef.current === null) return;

    const savedVisibleCount = savedVisibleCountRef.current;

    if (savedVisibleCount && visibleItems.length < Math.min(savedVisibleCount, filteredItems.length)) {
      return;
    }

    const scrollY = savedScrollYRef.current;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
        savedScrollYRef.current = null;
        savedVisibleCountRef.current = null;
        sessionStorage.removeItem(RESTORE_STATE_KEY);
        sessionStorage.removeItem(VISIBLE_COUNT_KEY);
        sessionStorage.removeItem(SCROLL_Y_KEY);
      });
    });
  }, [visibleItems.length, filteredItems.length]);

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

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (
          entry.isIntersecting &&
          visibleCount < filteredItems.length
        ) {
          setVisibleCount((value) => value + PAGE_SIZE);
        }
      },
      {
        rootMargin: '600px 0px',
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [visibleCount, filteredItems.length]);

  function toggleFilter() {
    setFilterOpen((value) => !value);
  }

  function resetList() {
    setVisibleCount(PAGE_SIZE);
    savedScrollYRef.current = null;
    savedVisibleCountRef.current = null;
    sessionStorage.removeItem(RESTORE_STATE_KEY);
    sessionStorage.removeItem(VISIBLE_COUNT_KEY);
    sessionStorage.removeItem(SCROLL_Y_KEY);
  }

  function rememberListState() {
    sessionStorage.setItem(RESTORE_STATE_KEY, 'true');
    sessionStorage.setItem(VISIBLE_COUNT_KEY, String(visibleCount));
    sessionStorage.setItem(SCROLL_Y_KEY, String(window.scrollY));
  }

  function changeType(type: MediaType) {
    setSelectedType(type);
    setSelectedIndex(null);
    resetList();
  }

  const hasFilter = selectedType !== 'all';

  return (
    <>
      <section className="compactHeader">
        <span>{filteredItems.length}개</span>

        <div className="compactActions">
          <button
            type="button"
            className="sortPill"
            onClick={() => {
              setSort((value) => (value === 'newest' ? 'oldest' : 'newest'));
              setSelectedIndex(null);
              resetList();
            }}
          >
            {sort === 'newest' ? '최신순' : '오래된순'}
          </button>

          <button
            type="button"
            className={`filterIconButton ${filterOpen || hasFilter ? 'isActive' : ''}`}
            onClick={toggleFilter}
            aria-label="필터"
          >
            <ListFilter size={15} strokeWidth={1.8} />
          </button>
        </div>
      </section>

      <div className={`filterFrame ${filterOpen ? 'isOpen' : ''}`}>
        <div className="filterFrameInner">
          <section className="chipPanel">
            <div className="chipGroup">
              <button
                type="button"
                className={selectedType === 'all' ? 'isActive' : ''}
                onClick={() => changeType('all')}
              >
                전체
              </button>

              <button
                type="button"
                className={selectedType === 'image' ? 'isActive' : ''}
                onClick={() => changeType('image')}
              >
                사진
              </button>

              <button
                type="button"
                className={selectedType === 'video' ? 'isActive' : ''}
                onClick={() => changeType('video')}
              >
                영상
              </button>
            </div>
          </section>
        </div>
      </div>

      <div className="galleryGrid">
        {visibleItems.map((item, index) => (
          <button
            className="galleryItem card"
            key={item.id}
            type="button"
            onClick={() => {
              const actualIndex = filteredItems.findIndex(
                (media) => media.id === item.id
              );

              setSelectedIndex(actualIndex);
            }}
          >
            <img
              src={item.thumb || item.url}
              alt=""
              loading="lazy"
              ref={(node) => {
                if (node?.complete) {
                  node.classList.add('isLoaded');
                }
              }}
              onLoad={(e) => {
                e.currentTarget.classList.add('isLoaded');
              }}
              onError={(e) => {
                e.currentTarget.classList.add('isLoaded');
              }}
            />

            {item.kind === 'video' && (
              <div className="galleryPlay">
                <span>
                  <Play size={28} fill="currentColor" strokeWidth={0} />
                </span>
                <em>{formatDuration(item.runningTime)}</em>
              </div>
            )}
          </button>
        ))}
      </div>

      {visibleCount < filteredItems.length && (
        <div ref={loadMoreRef} style={{ height: 1 }} />
      )}

      {!filteredItems.length && (
        <p className="emptyStateText">해당 조건의 미디어가 없습니다.</p>
      )}

      <button
        className={`scrollTopButton ${showTop ? 'isVisible' : ''}`}
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="맨 위로"
      >
        <ArrowUp size={15} strokeWidth={1.9} />
      </button>

      {selectedIndex !== null && (
        <MediaLightbox
          items={filteredItems}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onBeforeNavigate={rememberListState}
        />
      )}
    </>
  );
}