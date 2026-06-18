export function getKoreanNow() {
  const now = new Date();

  return new Date(
    now.toLocaleString('en-US', {
      timeZone: 'Asia/Seoul',
    })
  );
}

export function formatKoreanDate(iso: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}년 ${mm}월 ${dd}일`;
}

export function formatDateKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function formatKoreanTime(iso: string) {
  const d = new Date(iso);
  const isPM = d.getHours() >= 12;
  let h = d.getHours() % 12;
  if (h === 0) h = 12;
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${isPM ? '오후' : '오전'} ${h}:${m}`;
}

export function formatDuration(value?: number | string | null) {
  if (value == null || value === '') return '00:00';
  const raw = typeof value === 'string' ? Number(value) : value;
  const seconds = raw > 1000 ? Math.round(raw / 1000) : Math.round(raw);
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}
