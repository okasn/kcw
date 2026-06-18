'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUp, ListFilter } from 'lucide-react';
import type { DayGroup } from '@/lib/getArchiveData';

type SortMode = 'newest' | 'oldest';

const STORAGE_KEY = 'chatDayFilters';
const PAGE_SIZE = 36;


export default function ChatDayGridClient({ days }: { days: DayGroup[] }) {
  const [hydrated, setHydrated] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [sort, setSort] = useState<SortMode>('newest');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showTop, setShowTop] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.filterOpen === 'boolean') {
          setFilterOpen(parsed.filterOpen);
        }
        if (typeof parsed.selectedYear === 'string') setSelectedYear(parsed.selectedYear);
        if (typeof parsed.selectedMonth === 'string') setSelectedMonth(parsed.selectedMonth);
        if (parsed.sort === 'newest' || parsed.sort === 'oldest') setSort(parsed.sort);
      } catch {}
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ filterOpen, selectedYear, selectedMonth, sort })
    );
  }, [hydrated, filterOpen, selectedYear, selectedMonth, sort]);

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
    return Array.from(new Set(days.map((day) => day.year))).sort((a, b) =>
      a < b ? 1 : -1
    );
  }, [days]);

  const months = useMemo(() => {
    const filtered =
      selectedYear === 'all'
        ? days
        : days.filter((day) => day.year === selectedYear);

    return Array.from(new Set(filtered.map((day) => day.month))).sort(
      (a, b) => Number(a) - Number(b)
    );
  }, [days, selectedYear]);

  const filteredDays = useMemo(() => {
    const result = days.filter((day) => {
      const yearOk = selectedYear === 'all' || day.year === selectedYear;
      const monthOk = selectedMonth === 'all' || day.month === selectedMonth;
      return yearOk && monthOk;
    });

    return result.sort((a, b) => {
      const diff = +new Date(a.date) - +new Date(b.date);
      return sort === 'oldest' ? diff : -diff;
    });
  }, [days, selectedYear, selectedMonth, sort]);

  const visibleDays = filteredDays.slice(0, visibleCount);

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (
          entry.isIntersecting &&
          visibleCount < filteredDays.length
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
  }, [visibleCount, filteredDays.length]);

  function toggleFilter() {
    setFilterOpen((value) => !value);
  }

  function resetList() {
    setVisibleCount(PAGE_SIZE);
  }

  function changeYear(year: string) {
    setSelectedYear(year);
    resetList();
  }

  function clearFilter() {
    setSelectedYear('all');
    setSelectedMonth('all');
    setSort('newest');
    resetList();
  }

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const hasFilter = selectedYear !== 'all' || selectedMonth !== 'all';

  return (
    <>
      <section className="compactHeader">
        <span>
          {filteredDays.length}일
        </span>

        <div className="compactActions">
          <button
            type="button"
            className="sortPill"
            onClick={() => {
              setSort((v) => (v === 'newest' ? 'oldest' : 'newest'));
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
                className={selectedYear === 'all' ? 'isActive' : ''}
                onClick={() => changeYear('all')}
              >
                전체 년도
              </button>

              {years.map((year) => (
                <button
                  type="button"
                  key={year}
                  className={selectedYear === year ? 'isActive' : ''}
                  onClick={() => changeYear(year)}
                >
                  {Number(year)}년
                </button>
              ))}
            </div>

            <div className="chipGroup">
              <button
                type="button"
                className={selectedMonth === 'all' ? 'isActive' : ''}
                onClick={() => {
                  setSelectedMonth('all');
                  resetList();
                }}
              >
                전체 월
              </button>

              {months.map((month) => (
                <button
                  type="button"
                  key={month}
                  className={selectedMonth === month ? 'isActive' : ''}
                  onClick={() => {
                    setSelectedMonth(month);
                    resetList();
                  }}
                >
                  {Number(month)}월
                </button>
              ))}
            </div>

            {hasFilter && (
              <button type="button" className="resetFilterButton" onClick={clearFilter}>
                필터 초기화
              </button>
            )}
          </section>
        </div>
      </div>

      <div className="dayGrid">
        {visibleDays.map((day) => (
          <Link className="dayCard card" href={`/chat/${day.date}`} key={day.date}>
            <div className="dayThumb">
              {day.thumbnail ? (
                <img src={day.thumbnail} alt="" />
              ) : (
                <div className="dayEmpty">
                  <span>{day.shortDate}</span>
                </div>
              )}

              <div className="dayHover">
                <strong>{day.date.replaceAll('-', '.')}</strong>
                <span>
                  메시지 {day.messageCount}
                  {day.imageCount ? ` · 사진 ${day.imageCount}` : ''}
                  {day.videoCount ? ` · 영상 ${day.videoCount}` : ''}
                  {day.audioCount ? ` · 음성 ${day.audioCount}` : ''}
                </span>
              </div>
            </div>

            <div className="dayInfo">
              <strong>{day.shortDate}</strong>
              <span>
                메시지 {day.messageCount}
                {day.imageCount ? ` · 사진 ${day.imageCount}` : ''}
                {day.videoCount ? ` · 영상 ${day.videoCount}` : ''}
                {day.audioCount ? ` · 음성 ${day.audioCount}` : ''}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {visibleCount < filteredDays.length && (
        <div ref={loadMoreRef} className="loadMoreTrigger" />
      )}

      {!filteredDays.length && (
        <p className="emptyStateText">해당 조건의 채팅이 없습니다.</p>
      )}

      <button
        className={`scrollTopButton ${showTop ? 'isVisible' : ''}`}
        type="button"
        onClick={scrollTop}
        aria-label="맨 위로"
      >
        <ArrowUp size={15} strokeWidth={1.9} />
      </button>
    </>
  );
}