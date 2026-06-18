'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUp, ArrowUpRight, Download, ListFilter } from 'lucide-react';
import VoiceMessage from '@/components/chat/VoiceMessage';

type VoiceItem = {
  id: string;
  createdAt: string;
  runningTime: number | string | null | undefined;
  url: string;
  chatHref: string;
};

type SortMode = 'newest' | 'oldest';

const PAGE_SIZE = 50;


function formatShortDate(iso: string) {
  const d = new Date(iso);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');

  const isPM = d.getHours() >= 12;
  let h = d.getHours() % 12;
  if (h === 0) h = 12;

  const min = String(d.getMinutes()).padStart(2, '0');

  return `${yy}.${mm}.${dd} ${isPM ? '오후' : '오전'} ${h}:${min}`;
}

export default function VoicesClient({ voices = [] }: { voices?: VoiceItem[] }) {
  const [hydrated, setHydrated] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState<SortMode>('newest');
  const [year, setYear] = useState('all');
  const [month, setMonth] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('voiceFilters');

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.filterOpen === 'boolean') setFilterOpen(parsed.filterOpen);
        if (parsed.sort === 'newest' || parsed.sort === 'oldest') setSort(parsed.sort);
        if (typeof parsed.year === 'string') setYear(parsed.year);
        if (typeof parsed.month === 'string') setMonth(parsed.month);
      } catch {}
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(
      'voiceFilters',
      JSON.stringify({ filterOpen, sort, year, month })
    );
  }, [hydrated, filterOpen, sort, year, month]);

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

  const years = useMemo(() => {
    return Array.from(new Set(voices.map((v) => v.createdAt.slice(0, 4)))).sort(
      (a, b) => (a < b ? 1 : -1)
    );
  }, [voices]);

  const months = useMemo(() => {
    const base =
      year === 'all'
        ? voices
        : voices.filter((v) => v.createdAt.slice(0, 4) === year);

    return Array.from(new Set(base.map((v) => v.createdAt.slice(5, 7)))).sort(
      (a, b) => Number(a) - Number(b)
    );
  }, [voices, year]);

  const filteredVoices = useMemo(() => {
    const result = voices.filter((voice) => {
      if (year !== 'all' && voice.createdAt.slice(0, 4) !== year) return false;
      if (month !== 'all' && voice.createdAt.slice(5, 7) !== month) return false;
      return true;
    });

    return result.sort((a, b) => {
      const diff = +new Date(a.createdAt) - +new Date(b.createdAt);
      return sort === 'oldest' ? diff : -diff;
    });
  }, [voices, year, month, sort]);

  const visibleVoices = filteredVoices.slice(0, visibleCount);

  function toggleFilter() {
    setFilterOpen((value) => !value);
  }

  function resetList() {
    setVisibleCount(PAGE_SIZE);
  }

  function clearFilter() {
    setYear('all');
    setMonth('all');
    resetList();
  }

  const hasFilter = year !== 'all' || month !== 'all';

  return (
    <>
      <section className="voiceCompactHeader">
        <h2>{filteredVoices.length}개</h2>

        <div className="voiceCompactActions">
          <button
            type="button"
            className="voiceSortPill"
            onClick={() => {
              setSort((v) => (v === 'newest' ? 'oldest' : 'newest'));
              resetList();
            }}
          >
            {sort === 'newest' ? '최신순' : '오래된순'}
          </button>

          <button
            type="button"
            className={`voiceFilterIcon ${filterOpen || hasFilter ? 'isActive' : ''}`}
            onClick={toggleFilter}
            aria-label="필터"
          >
            <ListFilter size={15} strokeWidth={1.8} />
          </button>
        </div>
      </section>

      <div className={`filterFrame ${filterOpen ? 'isOpen' : ''}`}>
        <div className="filterFrameInner">
          <section className="voiceChipPanel">
            <div className="voiceChipGroup">
              <button
                type="button"
                className={year === 'all' ? 'isActive' : ''}
                onClick={() => {
                  setYear('all');
                  resetList();
                }}
              >
                전체 년도
              </button>

              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  className={year === y ? 'isActive' : ''}
                  onClick={() => {
                    setYear(y);
                    resetList();
                  }}
                >
                  {Number(y)}년
                </button>
              ))}
            </div>

            <div className="voiceChipGroup month">
              <button
                type="button"
                className={month === 'all' ? 'isActive' : ''}
                onClick={() => {
                  setMonth('all');
                  resetList();
                }}
              >
                전체 월
              </button>

              {months.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={month === m ? 'isActive' : ''}
                  onClick={() => {
                    setMonth(m);
                    resetList();
                  }}
                >
                  {Number(m)}월
                </button>
              ))}
            </div>

            {hasFilter && (
              <button type="button" className="voiceResetButton" onClick={clearFilter}>
                필터 초기화
              </button>
            )}
          </section>
        </div>
      </div>

      <div className="voiceGrid">
        {visibleVoices.map((voice) => (
          <article key={voice.id} className="voiceMiniCard">
            <div className="voiceMiniTop">
              <span>{formatShortDate(voice.createdAt)}</span>

              <div className="voiceMiniActions">
                <Link href={voice.chatHref} className="voiceActionLink" aria-label="채팅에서 보기">
                  <ArrowUpRight size={12} strokeWidth={1.8} />
                </Link>

                <a
                  href={voice.url}
                  download
                  className="voiceActionLink"
                  aria-label="음성 다운로드"
                >
                  <Download size={12} strokeWidth={1.8} />
                </a>
              </div>
            </div>

            <VoiceMessage
              msg={{
                id: voice.id,
                createdAt: voice.createdAt,
                runningTime: voice.runningTime,
                content: voice.url,
                type: 'sound',
              }}
            />
          </article>
        ))}
      </div>

      {visibleCount < filteredVoices.length && (
        <button
          type="button"
          className="loadMoreButton"
          onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
        >
          더보기
        </button>
      )}

      {!filteredVoices.length && (
        <p className="emptyStateText">해당 조건의 음성 메시지가 없습니다.</p>
      )}

      <button
        className={`scrollTopButton ${showTop ? 'isVisible' : ''}`}
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="맨 위로"
      >
        <ArrowUp size={15} strokeWidth={1.9} />
      </button>
    </>
  );
}