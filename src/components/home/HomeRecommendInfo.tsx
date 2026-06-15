'use client';

import { useState } from 'react';
import { CircleAlert, X } from 'lucide-react';

export default function HomeRecommendInfo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="homeInfoButton"
        onClick={() => setOpen(true)}
        aria-label="오늘의 추천 메시지 안내"
      >
        <CircleAlert size={10} strokeWidth={1.8} />
      </button>

      {open && (
        <div className="homeInfoOverlay" onClick={() => setOpen(false)}>
          <section className="homeInfoModal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="homeInfoClose"
              onClick={() => setOpen(false)}
              aria-label="닫기"
            >
              <X size={15} strokeWidth={2} />
            </button>

            <h2>오늘의 추천 메시지</h2>
            <p>
              오늘 날짜의 이전 연도 메시지를 보여줘요.<br/>
              같은 날짜의 메시지가 없다면, 가장 가까운 날의 메시지를 추천해요.
            </p>
          </section>
        </div>
      )}
    </>
  );
}