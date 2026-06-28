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

export const getAllMessages = cache(async (): Promise<ChatMessage[]> => {
  const manifest = await getManifest();
  const all: ChatMessage[] = [];

  await Promise.all(
    manifest.months.map(async (month: MonthItem) => {
      const filePath = path.join(process.cwd(), 'public', month.file);

      try {
        const raw = await fs.readFile(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        all.push(...normalizeMessages(parsed));
      } catch {
        // 파일이 없거나 JSON 파싱 실패하면 무시
      }
    })
  );

  return all.sort(
    (a: ChatMessage, b: ChatMessage) =>
      +new Date(b.createdAt) - +new Date(a.createdAt)
  );
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