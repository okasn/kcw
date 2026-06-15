import type { ChatMessage } from './types';

export function normalizeMessages(data: any): ChatMessage[] {
  const items = Array.isArray(data) ? data : data?.chats || data?.messages || [];

  return items
    .filter((m: ChatMessage) => !m.deleted && !m.isHidden)
    .sort((a: ChatMessage, b: ChatMessage) => +new Date(a.createdAt) - +new Date(b.createdAt));
}

export function getMediaUrl(msg: ChatMessage) {
  const type = String(msg.type || '').toLowerCase();

  if (msg.emoticonItem) {
    const e = msg.emoticonItem;

    return (
      e.imageURL ||
      e.imageUrl ||
      e.thumbnailURL ||
      e.thumbnailUrl ||
      e.resourceURL ||
      e.resourceUrl ||
      e.fileURL ||
      e.fileUrl ||
      e.url ||
      ''
    );
  }

  if (type.includes('video')) {
    return typeof msg.content === 'string' ? msg.content : '';
  }

  if (type.includes('voice') || type.includes('audio') || type === 'sound') {
    if (typeof msg.content === 'string' && msg.content) return msg.content;
    if (typeof msg.thumbnail === 'string' && msg.thumbnail) return msg.thumbnail;
    return '';
  }

  if (type.includes('image') || type.includes('photo')) {
    if (typeof msg.content === 'string' && msg.content) return msg.content;
    if (typeof msg.thumbnail === 'string' && msg.thumbnail) return msg.thumbnail;
  }

  if (typeof msg.content === 'string' && msg.content.startsWith('http')) {
    return msg.content;
  }

  if (typeof msg.thumbnail === 'string' && msg.thumbnail) {
    return msg.thumbnail;
  }

  return '';
}

export function getThumbnailUrl(msg: ChatMessage) {
  const type = String(msg.type || '').toLowerCase();

  if (type.includes('video')) {
    return typeof msg.thumbnail === 'string' ? msg.thumbnail : '';
  }

  if (type.includes('image') || type.includes('photo')) {
    if (typeof msg.thumbnail === 'string' && msg.thumbnail) return msg.thumbnail;
    if (typeof msg.content === 'string' && msg.content) return msg.content;
  }

  return getMediaUrl(msg);
}

export function getReplyPreview(msg: ChatMessage) {
  if (msg.mentionedMessageDeleted) return '삭제된 메시지입니다.';
  if (msg.mentionedMessageReported) return '신고된 메시지입니다.';
  if (msg.mentionedMessageContent) return msg.mentionedMessageContent;
  if (msg.mentionedMessageTranslatedMessage) return msg.mentionedMessageTranslatedMessage;

  // 기존: return '이모티콘';
  if (msg.mentionedMessageEmoticonItem) return '';

  return '';
}

export function getKind(msg: ChatMessage) {
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

export function getTextContent(msg: ChatMessage, fanNickname = '딸랑단') {
  const content = msg.content || msg.translatedMessage || '';

  if (msg.hasNick && content) {
    return `${fanNickname}${content}`;
  }

  return content;
}