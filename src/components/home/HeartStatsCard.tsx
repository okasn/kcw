'use client';

import { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';

type HeartStat = {
  heart: string;
  count: number;
};

export default function HeartStatsCard({
  stats,
  total,
  dayCount,
}: {
  stats: HeartStat[];
  total: number;
  dayCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

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
                <span>총 하트</span>
                <strong>{total.toLocaleString()}개</strong>
              </div>
              <div>
                <span>종류</span>
                <strong>{stats.length}개</strong>
              </div>
              <div>
                <span>395일 중</span>
                <strong>{dayCount}일</strong>
              </div>
            </div>

            <section className="heartStatsSection">
              <div className="heartStatsList">
                {stats.map((item, index) => (
                  <div className="heartStatsRow" key={item.heart}>
                    <div className="heartStatsRowHead">
                      <div className="heartStatsRankHeart">
                        <em>{index + 1}</em>
                        <span>{item.heart}</span>
                      </div>
                      <strong>{item.count.toLocaleString()}개</strong>
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