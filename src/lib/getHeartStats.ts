import fs from 'fs/promises';
import path from 'path';
import { cache } from 'react';

export type HeartStat = {
  heart: string;
  count: number;
};

export type HeartStats = {
  stats: HeartStat[];
  total: number;
  dayCount: number;
};

type HeartDay = {
  messages?: Array<{
    content?: string;
  }>;
};

const HEARTS = [
  '🩷', '❤️', '🧡', '💛', '💚', '🩵', '💙', '💜', '🖤', '🩶', '🤍', '🤎',
  '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟',
  '🫰', '🫶',
];

export const getHeartStats = cache(async (): Promise<HeartStats> => {
  const filePath = path.join(process.cwd(), 'public', 'data', 'heart.json');

  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const days = JSON.parse(raw) as HeartDay[];
    const counts = new Map<string, number>();

    for (const heart of HEARTS) {
      counts.set(heart, 0);
    }

    for (const day of days) {
      for (const msg of day.messages || []) {
        const text = msg.content || '';

        for (const heart of HEARTS) {
          const count = text.split(heart).length - 1;

          if (count > 0) {
            counts.set(heart, (counts.get(heart) || 0) + count);
          }
        }
      }
    }

    const stats = Array.from(counts.entries())
      .map(([heart, count]) => ({ heart, count }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);

    const total = stats.reduce((sum, item) => sum + item.count, 0);

    return {
      stats,
      total,
      dayCount: days.length,
    };
  } catch {
    return {
      stats: [],
      total: 0,
      dayCount: 0,
    };
  }
});