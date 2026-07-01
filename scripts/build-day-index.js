const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'day-index.json');

function getKoreanDateKey(iso) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
}

function getKind(msg) {
  if (msg.deleted === true) return 'deleted';
  if (msg.emoticonItem) return 'emoticon';

  const t = String(msg.type || '').toLowerCase();

  if (t.includes('voice') || t.includes('audio') || t === 'sound') return 'audio';
  if (t.includes('video')) return 'video';
  if (t.includes('image') || t.includes('photo')) return 'image';
  if (t.includes('emoticon')) return 'emoticon';
  if (msg.thumbnail && String(msg.thumbnail).includes('.m4a')) return 'audio';
  if (msg.thumbnail) return 'image';

  return 'text';
}

function getThumbnailUrl(msg) {
  if (msg.deleted === true) return '';
  const type = String(msg.type || '').toLowerCase();

  if (type.includes('video')) {
    return typeof msg.thumbnail === 'string' ? msg.thumbnail : '';
  }

  if (type.includes('image') || type.includes('photo')) {
    if (typeof msg.thumbnail === 'string' && msg.thumbnail) return msg.thumbnail;
    if (typeof msg.content === 'string' && msg.content) return msg.content;
  }

  return '';
}

function getFallbackThumbnailUrl(msg) {
  if (msg.deleted === true) return '';
  const type = String(msg.type || '').toLowerCase();

  if (type.includes('video')) {
    return typeof msg.thumbnailOriginalUrl === 'string'
      ? msg.thumbnailOriginalUrl
      : '';
  }

  if (type.includes('image') || type.includes('photo')) {
    if (typeof msg.thumbnailOriginalUrl === 'string' && msg.thumbnailOriginalUrl) {
      return msg.thumbnailOriginalUrl;
    }

    if (typeof msg.contentOriginalUrl === 'string' && msg.contentOriginalUrl) {
      return msg.contentOriginalUrl;
    }
  }

  return '';
}

function normalizeMessages(data) {
  const items = Array.isArray(data) ? data : data?.chats || data?.messages || [];

  return items.filter((m) => !m.isHidden);
}

const files = fs
  .readdirSync(DATA_DIR)
  .filter((file) => /^\d{4}-\d{2}\.json$/.test(file))
  .sort();

const map = new Map();

for (const file of files) {
  const filePath = path.join(DATA_DIR, file);
  const raw = fs.readFileSync(filePath, 'utf8');
  const messages = normalizeMessages(JSON.parse(raw));

  for (const msg of messages) {
    if (!msg.createdAt) continue;

    const date = getKoreanDateKey(msg.createdAt);
    const kind = getKind(msg);

    if (!map.has(date)) {
      map.set(date, {
        date,
        year: date.slice(0, 4),
        month: date.slice(5, 7),
        shortDate: date.slice(2).replaceAll('-', ''),
        thumbnail: '',
        thumbnailFallback: '',
        messageCount: 0,
        imageCount: 0,
        videoCount: 0,
        audioCount: 0,
      });
    }

    const day = map.get(date);

    day.messageCount += 1;

    if (kind === 'image') day.imageCount += 1;
    if (kind === 'video') day.videoCount += 1;
    if (kind === 'audio') day.audioCount += 1;

    if (!day.thumbnail && (kind === 'image' || kind === 'video')) {
      day.thumbnail = getThumbnailUrl(msg);
      day.thumbnailFallback = getFallbackThumbnailUrl(msg);
    }
  }
}

const result = Array.from(map.values()).sort((a, b) =>
  a.date < b.date ? 1 : -1
);

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf8');

console.log('완료:', OUTPUT_FILE);
console.log('날짜 수:', result.length);