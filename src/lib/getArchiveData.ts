import fs from 'fs/promises';
import path from 'path';
import { cache } from 'react';
import { getManifest } from './getManifest';
import { getKoreanDateKey } from './format';
import {
  getFallbackThumbnailUrl,
  getKind,
  getThumbnailUrl,
  normalizeMessages,
} from './message';
import type { ChatMessage, MonthItem } from './types';

export type DayGroup = {
  date: string;
  year: string;
  month: string;
  shortDate: string;
  thumbnail: string;
  thumbnailFallback?: string;
  messageCount: number;
  imageCount: number;
  videoCount: number;
  audioCount: number;
};

async function readMonthMessages(month: MonthItem): Promise<ChatMessage[]> {
  const filePath = path.join(process.cwd(), 'public', month.file);

  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return normalizeMessages(parsed);
  } catch {
    return [];
  }
}

export const getAllMessages = cache(async (): Promise<ChatMessage[]> => {
  const manifest = await getManifest();

  const monthMessages = await Promise.all(
    manifest.months.map((month: MonthItem) => readMonthMessages(month))
  );

  return monthMessages
    .flat()
    .sort(
      (a: ChatMessage, b: ChatMessage) =>
        +new Date(b.createdAt) - +new Date(a.createdAt)
    );
});

export const getMessagesByDate = cache(async (date: string): Promise<ChatMessage[]> => {
  const manifest = await getManifest();
  const monthId = date.slice(0, 7);

  const candidateMonths = manifest.months.filter((month: MonthItem) => {
    if (month.id === monthId) return true;

    // UTC → KST 날짜 경계 때문에 전월/다음월 파일에도 같은 KST 날짜가 걸칠 수 있음
    const current = new Date(`${monthId}-01T00:00:00Z`);
    const prev = new Date(current);
    prev.setUTCMonth(prev.getUTCMonth() - 1);

    const next = new Date(current);
    next.setUTCMonth(next.getUTCMonth() + 1);

    const prevId = `${prev.getUTCFullYear()}-${String(prev.getUTCMonth() + 1).padStart(2, '0')}`;
    const nextId = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}`;

    return month.id === prevId || month.id === nextId;
  });

  const monthMessages = await Promise.all(
    candidateMonths.map((month: MonthItem) => readMonthMessages(month))
  );

  return monthMessages
    .flat()
    .filter((msg) => getKoreanDateKey(msg.createdAt) === date)
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
});

export const getDayGroups = cache(async (): Promise<DayGroup[]> => {
  const messages = await getAllMessages();
  const map = new Map<string, ChatMessage[]>();

  for (const msg of messages) {
    const date = getKoreanDateKey(msg.createdAt);

    if (!map.has(date)) {
      map.set(date, []);
    }

    map.get(date)!.push(msg);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([date, items]) => {
      const media = items.find((msg: ChatMessage) => {
        const kind = getKind(msg);
        return kind === 'image' || kind === 'video';
      });

      const imageCount = items.filter(
        (msg: ChatMessage) => getKind(msg) === 'image'
      ).length;

      const videoCount = items.filter(
        (msg: ChatMessage) => getKind(msg) === 'video'
      ).length;

      const audioCount = items.filter(
        (msg: ChatMessage) => getKind(msg) === 'audio'
      ).length;

      return {
        date,
        year: date.slice(0, 4),
        month: date.slice(5, 7),
        shortDate: date.slice(2).replaceAll('-', ''),
        thumbnail: media ? getThumbnailUrl(media) : '',
        thumbnailFallback: media ? getFallbackThumbnailUrl(media) : '',
        messageCount: items.length,
        imageCount,
        videoCount,
        audioCount,
      };
    });
});