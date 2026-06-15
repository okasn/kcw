import { formatKoreanDate } from '@/lib/format';
export default function DateDivider({ iso }: { iso: string }) {
  return <div className="dateDivider"><span>{formatKoreanDate(iso)}</span></div>;
}
