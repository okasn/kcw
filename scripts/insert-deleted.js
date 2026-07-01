const fs = require("fs");
const path = require("path");

const DATA_DIR = "public/data";
const DELETED_FILE = "/Users/taehyun/Downloads/1/deleted_messages_room.json";;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function monthKey(dateString) {
  if (!dateString) return null;
  const d = new Date(dateString);
  if (isNaN(d)) return null;
  return d.toISOString().slice(0, 7); // 2024-04
}

function inRange(key) {
  return key >= "2024-04" && key <= "2026-06";
}

const deletedMessages = readJson(DELETED_FILE);

const grouped = {};

for (const msg of deletedMessages) {
  const key = monthKey(msg.createdAt);
  if (!key || !inRange(key)) continue;

  if (!grouped[key]) grouped[key] = [];
  grouped[key].push({
    ...msg,
    deleted: true
  });
}

for (const [key, deletedList] of Object.entries(grouped)) {
  const filePath = path.join(DATA_DIR, `${key}.json`);

  if (!fs.existsSync(filePath)) {
    console.log(`없음: ${filePath}`);
    continue;
  }

  const current = readJson(filePath);

  const existingIds = new Set(current.map(x => x.id));

  const toInsert = deletedList.filter(x => !existingIds.has(x.id));

  const merged = [...current, ...toInsert].sort((a, b) => {
    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
  });

  // 백업 생성
  const backupPath = path.join(DATA_DIR, `${key}.backup.json`);
  if (!fs.existsSync(backupPath)) {
    writeJson(backupPath, current);
  }

  writeJson(filePath, merged);

  console.log(`${key}: 추가 ${toInsert.length}개 / 총 ${merged.length}개`);
}

console.log("완료");