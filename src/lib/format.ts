const KOREA_TIME_ZONE = 'Asia/Seoul';

export function getKoreanNow() {
  const now = new Date();

  return new Date(
    now.toLocaleString('en-US', {
      timeZone: KOREA_TIME_ZONE,
    })
  );
}

export function getKoreanDateKey(iso: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: KOREA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
}

export function formatKoreanDate(iso: string) {
  const dateKey = getKoreanDateKey(iso);
  const [yyyy, mm, dd] = dateKey.split('-');

  return `${yyyy}년 ${mm}월 ${dd}일`;
}

export function formatDateKey(iso: string) {
  return getKoreanDateKey(iso);
}

export function formatKoreanTime(iso: string) {
  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: KOREA_TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(new Date(iso));

  const dayPeriod = parts.find((part) => part.type === 'dayPeriod')?.value || '';
  const hour = parts.find((part) => part.type === 'hour')?.value || '';
  const minute = parts.find((part) => part.type === 'minute')?.value || '00';

  return `${dayPeriod} ${hour}:${minute}`;
}

export function formatDuration(value?: number | string | null) {
  if (value == null || value === '') return '00:00';

  const raw = typeof value === 'string' ? Number(value) : value;
  const seconds = raw > 1000 ? Math.round(raw / 1000) : Math.round(raw);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return `${mm}:${ss}`;
}