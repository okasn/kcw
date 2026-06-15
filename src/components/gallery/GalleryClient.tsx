'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatDuration } from '@/lib/format';
import MediaLightbox, { type LightboxItem } from '@/components/media/MediaLightbox';
import { ArrowUp, ListFilter, Play } from 'lucide-react';

type MediaType = 'all' | 'image' | 'video';
type SortMode = 'newest' | 'oldest';

const PAGE_SIZE = 60;

export default function GalleryClient({ items }: { items: LightboxItem[] }) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<MediaType>('all');
  const [sort, setSort] = useState<SortMode>('newest');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showTop, setShowTop] = useState(false);

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
    function onScroll() {
      setShowTop(window.scrollY > 360);
    }

    onScroll();
    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  function changeType(type: MediaType) {
    setSelectedType(type);
    setSelectedIndex(null);
    setVisibleCount(PAGE_SIZE);
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
              setVisibleCount(PAGE_SIZE);
            }}
          >
            {sort === 'newest' ? '최신순' : '오래된순'}
          </button>

          <button
            type="button"
            className={`filterIconButton ${filterOpen || hasFilter ? 'isActive' : ''}`}
            onClick={() => setFilterOpen((value) => !value)}
            aria-label="필터"
          >
            <ListFilter size={15} strokeWidth={1.8} />
          </button>
        </div>
      </section>

      {filterOpen && (
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
      )}

      <div className="galleryGrid">
        {visibleItems.map((item, index) => (
          <button
            className="galleryItem card"
            key={item.id}
            type="button"
            onClick={() => setSelectedIndex(index)}
          >
            <img
              src={item.thumb || item.url}
              alt=""
              loading="lazy"
              onLoad={(e) => {
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
        <button
          type="button"
          className="loadMoreButton"
          onClick={() => setVisibleCount((value) => value + PAGE_SIZE)}
        >
          더보기
        </button>
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
          items={visibleItems}
          initialIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  );
}