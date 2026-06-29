'use client';

import { useEffect, useState } from 'react';
import { ChevronRight, X } from 'lucide-react';

type HeartStat = {
  heart: string;
  count: number;
};

type HeartStatsResponse = {
  total: number;
  dayCount: number;
  stats: HeartStat[];
};

export default function HeartStatsCard() {
  const [heartStats, setHeartStats] = useState<HeartStatsResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    fetch('/api/heart-stats')
      .then((res) => {
        if (!res.ok) throw new Error('failed to load heart stats');
        return res.json();
      })
      .then((data: HeartStatsResponse) => {
        if (
          typeof data.total === 'number' &&
          typeof data.dayCount === 'number' &&
          Array.isArray(data.stats)
        ) {
          setHeartStats(data);
        }
      })
      .catch(() => setHeartStats(null));
  }, []);

  function openModal() {
    setClosing(false);
    setOpen(true);
  }

  function closeModal() {
    setClosing(true);

    window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 190);
  }

  const stats = heartStats?.stats || [];
  const total = heartStats?.total || 0;
  const dayCount = heartStats?.dayCount || 0;
  const max = stats[0]?.count || 1;
  const topFive = stats.slice(0, 5);

  if (!total) return null;

  return (
    <>
      <button
        type="button"
        className="heartStatsCard"
        onClick={openModal}
      >
        <div>
          <p>채원이는 프롬으로</p>
          <strong>총 {total.toLocaleString()}개의 하트</strong>
          <span>를 보냈어요💖</span>
        </div>

        <ChevronRight size={17} strokeWidth={1.8} />
      </button>

      {open && (
        <div
          className={`heartStatsOverlay ${closing ? 'isClosing' : ''}`}
          onClick={closeModal}
        >
          <section
            className="heartStatsModal"
            role="dialog"
            aria-modal="true"
            aria-label="하트 통계"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="heartStatsHeader">
              <div>
                <h3>💌</h3>
                <p>채원이가 보낸 하트를 모았어요</p>
              </div>

              <button type="button" onClick={closeModal} aria-label="닫기">
                <X size={18} strokeWidth={1.8} />
              </button>
            </header>

            <div className="heartStatsSummary">
              <div>
                <strong>{total.toLocaleString()}개</strong>
                <span>총 하트</span>
              </div>
              <div>
                <strong>{stats.length}개</strong>
                <span>종류</span>
              </div>
              <div>
                <strong>{dayCount}일</strong>
                <span>날짜</span>
              </div>
            </div>

            <section className="heartStatsSection">
              <h4>많이 보낸 하트</h4>

              <div className="heartStatsTopGrid">
                {topFive.map((item, index) => (
                  <div key={item.heart}>
                    <em>{index + 1}</em>
                    <span>{item.heart}</span>
                    <strong>{item.count.toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="heartStatsSection">
              <h4>전체 하트</h4>

              <div className="heartStatsList">
                {stats.map((item) => (
                  <div className="heartStatsRow" key={item.heart}>
                    <div className="heartStatsRowHead">
                      <span>{item.heart}</span>
                      <strong>{item.count.toLocaleString()}개</strong>
                    </div>

                    <div className="heartStatsBar">
                      <i style={{ width: `${Math.max(5, (item.count / max) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </section>
        </div>
      )}
    </>
  );
}