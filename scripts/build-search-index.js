const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'search-index.json');

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

  return items
    .filter((m) => !m.isHidden)
    .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
}

function isMediaUrlText(value) {
  const text = String(value || '').trim();

  if (!/^https?:\/\//i.test(text)) return false;

  return /\.(jpg|jpeg|png|gif|webp|mp4|mov|m4a|mp3|wav|aac)(\?|#|$)/i.test(text);
}

function compactTextParts(parts) {
  return parts
    .map((part) => String(part || '').trim())
    .filter((part) => part && !isMediaUrlText(part))
    .join('\n');
}

function getTextContent(msg, fanNickname = '딸랑단') {
  if (msg.deleted === true) return '삭제된 메시지입니다.';

  const content = msg.content || msg.translatedMessage || '';

  if (msg.hasNick && content) {
    return `${fanNickname}${content}`;
  }

  return content;
}

const files = fs
  .readdirSync(DATA_DIR)
  .filter((file) => /^\d{4}-\d{2}\.json$/.test(file))
  .sort();

const index = [];

for (const file of files) {
  const filePath = path.join(DATA_DIR, file);
  const raw = fs.readFileSync(filePath, 'utf8');
  const messages = normalizeMessages(JSON.parse(raw));

  for (const msg of messages) {
    const text = compactTextParts([getTextContent(msg)]);
    const replyText = compactTextParts([
      msg.mentionedMessageContent,
      msg.mentionedMessageTranslatedMessage,
    ]);

    const searchText = compactTextParts([text, replyText]);

    if (!searchText.trim()) continue;

    const date = getKoreanDateKey(msg.createdAt);

    index.push({
      id: msg.id,
      createdAt: msg.createdAt,
      text,
      replyText,
      searchText,
      chatHref: `/chat/${date}#msg-${msg.id}`,
    });
  }
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2), 'utf8');

console.log('완료:', OUTPUT_FILE);
console.log('검색 인덱스 메시지 수:', index.length);