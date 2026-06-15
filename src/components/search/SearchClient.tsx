'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUp, Search, X } from 'lucide-react';

type SearchMessage = {
  id: string;
  createdAt: string;
  text: string;
  replyText: string;
  searchText: string;
  chatHref: string;
};

const RECENT_KEY = 'recentSearches';
const ACTIVE_QUERY_KEY = 'activeSearchQuery';
const ACTIVE_SCROLL_KEY = 'activeSearchScrollY';
const RESTORE_SEARCH_KEY = 'restoreSearchOnReturn';
const MAX_RECENT = 8;

function formatDate(iso: string) {
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

export default function SearchClient({ messages }: { messages: SearchMessage[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const [showTop, setShowTop] = useState(false);
  const [restoreScrollY, setRestoreScrollY] = useState<number | null>(null);

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
      const savedScrollY = Number(sessionStorage.getItem(ACTIVE_SCROLL_KEY) || 0);
      setRestoreScrollY(savedScrollY || null);
      sessionStorage.removeItem(RESTORE_SEARCH_KEY);
    }
  }, [searchParams]);

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
    const keyword = query.trim().toLowerCase();
    if (!keyword) return [];

    return messages.filter((msg) =>
      msg.searchText.toLowerCase().includes(keyword)
    );
  }, [messages, query]);

  useEffect(() => {
    if (restoreScrollY === null) return;

    requestAnimationFrame(() => {
      window.scrollTo(0, restoreScrollY);
      setRestoreScrollY(null);
    });
  }, [restoreScrollY, results.length]);

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
              sessionStorage.removeItem(ACTIVE_QUERY_KEY);
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
              sessionStorage.removeItem(ACTIVE_QUERY_KEY);
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
        <p className="searchCount">
          {results.length ? `${results.length}개 결과` : '검색 결과 없음'}
        </p>
      )}

      <div className="searchResultList">
        {results.map((msg) => (
          <Link
            href={withSearchParams(msg.chatHref, query)}
            className="searchResultItem"
            key={msg.id}
            onClick={() => {
              saveRecent(query);
              sessionStorage.setItem(ACTIVE_QUERY_KEY, query);
              sessionStorage.setItem(ACTIVE_SCROLL_KEY, String(window.scrollY));
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

      {query && !results.length && (
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