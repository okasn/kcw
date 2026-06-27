const fs = require('fs');
const path = require('path');

const CDN = 'https://cdn.kcws21.kr';

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const BACKUP_DIR = path.join(__dirname, '..', 'public', 'data_backup_before_cdn');

const FROMM_HOST = 'contents.frommyarti.com';

const ENABLED = {
  images: true,
  image_thumbnails: true,
  videos: true,
  video_thumbnails: true,
  voices: true,
  emoticons: true,
  reply_emoticons: true,
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function isFrommUrl(value) {
  if (typeof value !== 'string') return false;

  try {
    const url = new URL(value);
    return url.hostname === FROMM_HOST;
  } catch {
    return false;
  }
}

function fileNameFromUrl(value) {
  const url = new URL(value);
  return decodeURIComponent(path.basename(url.pathname));
}

function yearMonth(createdAt) {
  if (!createdAt) return null;

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) return null;

  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');

  return { year, month };
}

function cdnUrl(folder, createdAt, originalUrl) {
  const ym = yearMonth(createdAt);

  if (!ym) return originalUrl;

  const filename = fileNameFromUrl(originalUrl);

  return `${CDN}/${folder}/${ym.year}/${ym.month}/${filename}`;
}

function preserveOriginal(chat, key, originalUrl) {
  const backupKey = `${key}OriginalUrl`;

  if (!chat[backupKey]) {
    chat[backupKey] = originalUrl;
  }
}

function replaceField(chat, key, folder) {
  if (!ENABLED[folder]) return;

  const value = chat[key];

  if (!isFrommUrl(value)) return;

  preserveOriginal(chat, key, value);
  chat[key] = cdnUrl(folder, chat.createdAt, value);
}

function replaceNestedUrls(value, folder, createdAt) {
  if (!ENABLED[folder]) return value;

  if (typeof value === 'string') {
    if (!isFrommUrl(value)) return value;

    return cdnUrl(folder, createdAt, value);
  }

  if (Array.isArray(value)) {
    return value.map(item => replaceNestedUrls(item, folder, createdAt));
  }

  if (value && typeof value === 'object') {
    const next = {};

    for (const [key, child] of Object.entries(value)) {
      if (key.endsWith('OriginalUrl')) {
        next[key] = child;
        continue;
      }

      if (typeof child === 'string' && isFrommUrl(child)) {
        next[`${key}OriginalUrl`] = child;
      }

      next[key] = replaceNestedUrls(child, folder, createdAt);
    }

    return next;
  }

  return value;
}

function processChat(chat) {
  if (!chat || typeof chat !== 'object') return chat;

  const type = String(chat.type || '').toLowerCase();

  if (type === 'image') {
    replaceField(chat, 'content', 'images');
    replaceField(chat, 'thumbnail', 'image_thumbnails');
  }

  if (type === 'video') {
    replaceField(chat, 'content', 'videos');
    replaceField(chat, 'thumbnail', 'video_thumbnails');
  }

  if (type === 'sound') {
    replaceField(chat, 'content', 'voices');
    replaceField(chat, 'thumbnail', 'voices');
  }

  if (chat.emoticonItem) {
    chat.emoticonItemOriginal = chat.emoticonItemOriginal || chat.emoticonItem;
    chat.emoticonItem = replaceNestedUrls(
      chat.emoticonItem,
      'emoticons',
      chat.createdAt
    );
  }

  if (chat.mentionedMessageEmoticonItem) {
    chat.mentionedMessageEmoticonItemOriginal =
      chat.mentionedMessageEmoticonItemOriginal ||
      chat.mentionedMessageEmoticonItem;

    chat.mentionedMessageEmoticonItem = replaceNestedUrls(
      chat.mentionedMessageEmoticonItem,
      'reply_emoticons',
      chat.createdAt
    );
  }

  return chat;
}

function processFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);

  if (!Array.isArray(json)) {
    console.log(`[스킵] 배열 JSON 아님: ${filePath}`);
    return;
  }

  const relative = path.relative(DATA_DIR, filePath);
  const backupPath = path.join(BACKUP_DIR, relative);

  ensureDir(path.dirname(backupPath));

  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
  }

  const updated = json.map(processChat);

  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf8');

  console.log(`[완료] ${relative}`);
}

function main() {
  ensureDir(BACKUP_DIR);

  const files = fs
    .readdirSync(DATA_DIR)
    .filter(file => /^\d{4}-\d{2}\.json$/.test(file))
    .sort();

  console.log(`대상 파일: ${files.length}개`);

  for (const file of files) {
    processFile(path.join(DATA_DIR, file));
  }

  console.log('');
  console.log('끝');
  console.log(`백업 위치: ${BACKUP_DIR}`);
}

main();