'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUp, Search, X } from 'lucide-react';
import { getKoreanDateKey } from '@/lib/format';

type SearchMessage = {
  id: string;
  createdAt: string;
  text: string;
  replyText: string;
  searchText: string;
  chatHref: string;
};

type SortMode = 'newest' | 'oldest';

const RECENT_KEY = 'recentSearches';
const ACTIVE_SCROLL_KEY = 'activeSearchScrollY';
const ACTIVE_VISIBLE_COUNT_KEY = 'activeSearchVisibleCount';
const RESTORE_SEARCH_KEY = 'restoreSearchOnReturn';
const MAX_RECENT = 8;
const PAGE_SIZE = 50;

function formatDate(iso: string) {
  const dateKey = getKoreanDateKey(iso);
  const [yyyy, mm, dd] = dateKey.split('-');

  const time = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso));

  return `${yyyy.slice(2)}.${mm}.${dd} ${time}`;
}

function highlightText(text: string, keyword: string) {
  if (!keyword.trim()) return text;

  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

  return parts.map((part, index) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <mark key={index}>{part}</mark>
    ) : (
      part
    )
  );
}

function withSearchParams(href: string, query: string) {
  const [path, hash] = href.split('#');
  const params = new URLSearchParams({
    from: 'search',
    q: query.trim(),
  });

  return `${path}?${params.toString()}${hash ? `#${hash}` : ''}`;
}

export default function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortMode>('newest');
  const [messages, setMessages] = useState<SearchMessage[]>([]);
  const [searching, setSearching] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [showTop, setShowTop] = useState(false);
  const [restoreScrollY, setRestoreScrollY] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const restoreVisibleCountRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      if (saved) setRecent(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    const urlValue = searchParams.get('q') || '';
    const shouldRestore = sessionStorage.getItem(RESTORE_SEARCH_KEY) === 'true';

    setInputValue(urlValue);
    setQuery(urlValue);

    if (urlValue.trim()) {
      saveRecent(urlValue);
    }

    if (shouldRestore) {
      const savedVisibleCount = Number(sessionStorage.getItem(ACTIVE_VISIBLE_COUNT_KEY) || 0);
      const savedScrollY = Number(sessionStorage.getItem(ACTIVE_SCROLL_KEY) || 0);

      if (Number.isFinite(savedVisibleCount) && savedVisibleCount > PAGE_SIZE) {
        restoreVisibleCountRef.current = savedVisibleCount;
        setVisibleCount(savedVisibleCount);
      }

      if (Number.isFinite(savedScrollY) && savedScrollY > 0) {
        setRestoreScrollY(savedScrollY);
      }
    } else {
      sessionStorage.removeItem(ACTIVE_SCROLL_KEY);
      sessionStorage.removeItem(ACTIVE_VISIBLE_COUNT_KEY);
    }
  }, [searchParams]);

  useEffect(() => {
    const value = query.trim();

    if (!value) {
      setMessages([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();

    setSearching(true);

    fetch(`/api/search?q=${encodeURIComponent(value)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error('failed to search');
        return res.json();
      })
      .then((data: { messages?: SearchMessage[] }) => {
        setMessages(Array.isArray(data.messages) ? data.messages : []);
      })
      .catch((error) => {
        if (error?.name !== 'AbortError') {
          setMessages([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setSearching(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [query]);

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

  const results = useMemo(() => {
    if (!query.trim()) return [];

    return [...messages].sort((a, b) => {
      const diff = +new Date(a.createdAt) - +new Date(b.createdAt);
      return sort === 'oldest' ? diff : -diff;
    });
  }, [messages, query, sort]);

  const visibleResults = results.slice(0, visibleCount);

  useEffect(() => {
    if (restoreScrollY === null) return;

    const savedVisibleCount = restoreVisibleCountRef.current;

    if (savedVisibleCount && visibleResults.length < Math.min(savedVisibleCount, results.length)) {
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, restoreScrollY);
        setRestoreScrollY(null);
        restoreVisibleCountRef.current = null;
        sessionStorage.removeItem(RESTORE_SEARCH_KEY);
        sessionStorage.removeItem(ACTIVE_SCROLL_KEY);
        sessionStorage.removeItem(ACTIVE_VISIBLE_COUNT_KEY);
      });
    });
  }, [restoreScrollY, visibleResults.length, results.length]);

  useEffect(() => {
    if (restoreVisibleCountRef.current !== null) return;

    setVisibleCount(PAGE_SIZE);
  }, [query, sort]);

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (
          entry.isIntersecting &&
          visibleCount < results.length
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
  }, [visibleCount, results.length]);

  function saveRecent(keyword: string) {
    const value = keyword.trim();
    if (!value) return;

    setRecent((current) => {
      const next = [value, ...current.filter((item) => item !== value)].slice(
        0,
        MAX_RECENT
      );

      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }

  function clearRecent() {
    setRecent([]);
    localStorage.removeItem(RECENT_KEY);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const value = inputValue.trim();

    if (!value) {
      setQuery('');
      router.push('/search');
      return;
    }

    setQuery(value);
    saveRecent(value);
    router.push(`/search?q=${encodeURIComponent(value)}`);
  }

  return (
    <>
      <form className="searchBox" onSubmit={submit}>
        <Search size={16} strokeWidth={1.9} />

        <input
          value={inputValue}
          onChange={(e) => {
            const value = e.target.value;
            setInputValue(value);

            if (!value.trim()) {
              setQuery('');
            }
          }}
          placeholder="메시지 검색"
          autoComplete="off"
        />

        {inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue('');
              setQuery('');
              router.push('/search');
            }}
            aria-label="검색어 지우기"
          >
            <X size={15} strokeWidth={1.9} />
          </button>
        )}
      </form>

      {!query && recent.length > 0 && (
        <section className="recentSearch">
          <div className="recentSearchHead">
            <span>최근 검색</span>
            <button type="button" onClick={clearRecent}>
              지우기
            </button>
          </div>

          <div className="recentSearchList">
            {recent.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => {
                  setInputValue(item);
                  setQuery(item);
                  saveRecent(item);
                  router.push(`/search?q=${encodeURIComponent(item)}`);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      )}

      {query && (
        <section className="compactHeader">
          <span>
            {searching ? '검색 중...' : results.length ? `${results.length}개 결과` : '검색 결과 없음'}
          </span>

          <div className="compactActions">
            <button
              type="button"
              className="sortPill"
              onClick={() => {
                setSort((value) => (value === 'newest' ? 'oldest' : 'newest'));
              }}
            >
              {sort === 'newest' ? '최신순' : '오래된순'}
            </button>
          </div>
        </section>
      )}

      <div className="searchResultList">
        {visibleResults.map((msg) => (
          <Link
            href={withSearchParams(msg.chatHref, query)}
            className="searchResultItem"
            key={msg.id}
            onClick={() => {
              saveRecent(query);
              sessionStorage.setItem(ACTIVE_SCROLL_KEY, String(window.scrollY));
              sessionStorage.setItem(ACTIVE_VISIBLE_COUNT_KEY, String(visibleCount));
              sessionStorage.setItem(RESTORE_SEARCH_KEY, 'true');
            }}
          >
            <span>{formatDate(msg.createdAt)}</span>

            {msg.replyText && (
              <div className="searchReplyPreview">
                <span>답장</span>
                <p>{highlightText(msg.replyText, query)}</p>
              </div>
            )}

            {msg.text && <p>{highlightText(msg.text, query)}</p>}
          </Link>
        ))}
      </div>
      {visibleCount < results.length && (
        <div ref={loadMoreRef} className="loadMoreTrigger" />
      )}

      {query && !searching && !results.length && (
        <p className="emptyStateText">해당 검색어가 포함된 채팅이 없습니다.</p>
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