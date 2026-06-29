const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');

const HEARTS = [
  '🩷', '❤️', '🧡', '💛', '💚', '🩵', '💙', '💜', '🖤', '🩶', '🤍', '🤎',
  '💔', '❤️‍🔥', '❤️‍🩹', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟',
  '🫰', '🫶',
];

function getKoreanDateKey(iso) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
}

function normalizeMessages(data) {
  const items = Array.isArray(data) ? data : data?.chats || data?.messages || [];
  return items.filter((m) => !m.deleted && !m.isHidden);
}

function collectMainText(msg) {
  return [msg.content, msg.translatedMessage]
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean)
    .join('\n');
}

function findMatchedHearts(text) {
  return HEARTS.filter((heart) => text.includes(heart));
}

const files = fs
  .readdirSync(DATA_DIR)
  .filter((file) => /^\d{4}-\d{2}\.json$/.test(file))
  .sort();

const dayMap = new Map();

for (const file of files) {
  const filePath = path.join(DATA_DIR, file);
  const raw = fs.readFileSync(filePath, 'utf8');
  const messages = normalizeMessages(JSON.parse(raw));

  for (const msg of messages) {
    if (msg.userType !== 'star') continue;

    const text = collectMainText(msg);
    if (!text) continue;

    const hearts = findMatchedHearts(text);
    if (!hearts.length) continue;

    const date = getKoreanDateKey(msg.createdAt);

    if (!dayMap.has(date)) {
      dayMap.set(date, {
        date,
        count: 0,
        hearts: new Set(),
        messages: [],
      });
    }

    const day = dayMap.get(date);

    day.count += 1;

    for (const heart of hearts) {
      day.hearts.add(heart);
    }

    day.messages.push({
      id: msg.id,
      createdAt: msg.createdAt,
      hearts,
      content: text.replace(/\s+/g, ' ').trim(),
    });
  }
}

const result = Array.from(dayMap.values())
  .map((day) => ({
    date: day.date,
    count: day.count,
    hearts: Array.from(day.hearts),
    messages: day.messages,
  }))
  .sort((a, b) => (a.date < b.date ? 1 : -1));

const outputFile = path.join(DATA_DIR, 'heart-days.json');

fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf8');

console.log('완료:', outputFile);
console.log('하트 포함 날짜 수:', result.length);

for (const day of result) {
  console.log(`${day.date} / ${day.count}개 / ${day.hearts.join(' ')}`);
}