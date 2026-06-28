const fs = require('fs');
const path = require('path');

const CDN = 'https://cdn.kcws21.kr';
const FROMM_HOST = 'contents.frommyarti.com';

const TARGET_FILE = path.join(__dirname, '..', 'public', 'data', '2026-06.json');
const BACKUP_FILE = path.join(
  __dirname,
  '..',
  'public',
  'data',
  '2026-06.before-cdn-update.json'
);

const ENABLED = {
  images: true,
  image_thumbnails: true,
  videos: true,
  video_thumbnails: true,
  voices: true,
  emoticons: true,
  reply_emoticons: true,
};

function isFrommUrl(value) {
  if (typeof value !== 'string') return false;

  try {
    const url = new URL(value);
    return url.hostname === FROMM_HOST;
  } catch {
    return false;
  }
}

function filenameFromUrl(value) {
  const url = new URL(value);
  return decodeURIComponent(path.basename(url.pathname));
}

function yearMonth(createdAt) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return { year: 'unknown', month: 'unknown' };
  }

  return {
    year: String(date.getUTCFullYear()),
    month: String(date.getUTCMonth() + 1).padStart(2, '0'),
  };
}

function toCdnUrl(folder, createdAt, originalUrl) {
  const { year, month } = yearMonth(createdAt);
  const filename = filenameFromUrl(originalUrl);

  return `${CDN}/${folder}/${year}/${month}/${filename}`;
}

function replaceField(msg, key, folder) {
  if (!ENABLED[folder]) return false;

  const value = msg[key];

  if (!isFrommUrl(value)) return false;

  const originalKey = `${key}OriginalUrl`;

  if (!msg[originalKey]) {
    msg[originalKey] = value;
  }

  msg[key] = toCdnUrl(folder, msg.createdAt, value);

  return true;
}

function replaceNestedUrls(value, folder, createdAt) {
  if (!ENABLED[folder]) return { value, changed: 0 };

  let changed = 0;

  function walk(node) {
    if (typeof node === 'string') {
      if (!isFrommUrl(node)) return node;

      changed += 1;
      return toCdnUrl(folder, createdAt, node);
    }

    if (Array.isArray(node)) {
      return node.map(walk);
    }

    if (node && typeof node === 'object') {
      const next = {};

      for (const [key, child] of Object.entries(node)) {
        if (key.endsWith('OriginalUrl')) {
          next[key] = child;
          continue;
        }

        if (typeof child === 'string' && isFrommUrl(child)) {
          const originalKey = `${key}OriginalUrl`;

          if (!node[originalKey]) {
            next[originalKey] = child;
          }
        }

        next[key] = walk(child);
      }

      return next;
    }

    return node;
  }

  return {
    value: walk(value),
    changed,
  };
}

function processMessage(msg) {
  if (!msg || typeof msg !== 'object') return 0;

  let changed = 0;
  const type = String(msg.type || '').toLowerCase();

  if (type === 'image') {
    if (replaceField(msg, 'content', 'images')) changed += 1;
    if (replaceField(msg, 'thumbnail', 'image_thumbnails')) changed += 1;
  }

  if (type === 'video') {
    if (replaceField(msg, 'content', 'videos')) changed += 1;
    if (replaceField(msg, 'thumbnail', 'video_thumbnails')) changed += 1;
  }

  if (type === 'sound') {
    if (replaceField(msg, 'content', 'voices')) changed += 1;
    if (replaceField(msg, 'thumbnail', 'voices')) changed += 1;
  }

  if (msg.emoticonItem) {
    const result = replaceNestedUrls(msg.emoticonItem, 'emoticons', msg.createdAt);

    if (result.changed > 0 && !msg.emoticonItemOriginal) {
      msg.emoticonItemOriginal = msg.emoticonItem;
    }

    msg.emoticonItem = result.value;
    changed += result.changed;
  }

  if (msg.mentionedMessageEmoticonItem) {
    const result = replaceNestedUrls(
      msg.mentionedMessageEmoticonItem,
      'reply_emoticons',
      msg.createdAt
    );

    if (result.changed > 0 && !msg.mentionedMessageEmoticonItemOriginal) {
      msg.mentionedMessageEmoticonItemOriginal = msg.mentionedMessageEmoticonItem;
    }

    msg.mentionedMessageEmoticonItem = result.value;
    changed += result.changed;
  }

  return changed;
}

function main() {
  if (!fs.existsSync(TARGET_FILE)) {
    console.error('파일 없음:', TARGET_FILE);
    process.exit(1);
  }

  if (!fs.existsSync(BACKUP_FILE)) {
    fs.copyFileSync(TARGET_FILE, BACKUP_FILE);
    console.log('백업 생성:', BACKUP_FILE);
  }

  const data = JSON.parse(fs.readFileSync(TARGET_FILE, 'utf8'));

  if (!Array.isArray(data)) {
    console.error('2026-06.json이 배열 형태가 아님');
    process.exit(1);
  }

  let changedTotal = 0;

  for (const msg of data) {
    changedTotal += processMessage(msg);
  }

  fs.writeFileSync(TARGET_FILE, JSON.stringify(data, null, 2), 'utf8');

  console.log('완료');
  console.log('대상:', TARGET_FILE);
  console.log('치환 개수:', changedTotal);
}

main();