import type { ChatMessage } from './types';

export function normalizeMessages(data: any): ChatMessage[] {
  const items = Array.isArray(data) ? data : data?.chats || data?.messages || [];

  return items
    .filter((m: ChatMessage) => !m.isHidden)
    .sort((a: ChatMessage, b: ChatMessage) => +new Date(a.createdAt) - +new Date(b.createdAt));
}

export function isDeletedMessage(msg: ChatMessage) {
  return msg.deleted === true;
}

function getEmoticonUrl(item: any) {
  if (!item) return '';

  return (
    item.imageURL ||
    item.imageUrl ||
    item.thumbnailURL ||
    item.thumbnailUrl ||
    item.resourceURL ||
    item.resourceUrl ||
    item.fileURL ||
    item.fileUrl ||
    item.url ||
    ''
  );
}

function getEmoticonOriginalUrl(item: any) {
  if (!item) return '';

  return (
    item.imageURLOriginalUrl ||
    item.imageUrlOriginalUrl ||
    item.thumbnailURLOriginalUrl ||
    item.thumbnailUrlOriginalUrl ||
    item.resourceURLOriginalUrl ||
    item.resourceUrlOriginalUrl ||
    item.fileURLOriginalUrl ||
    item.fileUrlOriginalUrl ||
    item.urlOriginalUrl ||
    ''
  );
}

export function getMediaUrl(msg: ChatMessage) {
  if (isDeletedMessage(msg)) return '';

  const type = String(msg.type || '').toLowerCase();

  if (msg.emoticonItem) {
    return getEmoticonUrl(msg.emoticonItem);
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

export function getFallbackMediaUrl(msg: ChatMessage) {
  if (isDeletedMessage(msg)) return '';

  const type = String(msg.type || '').toLowerCase();

  if (msg.emoticonItem) {
    return getEmoticonOriginalUrl(msg.emoticonItem);
  }

  if (type.includes('video')) {
    if (typeof msg.contentOriginalUrl === 'string' && msg.contentOriginalUrl) {
      return msg.contentOriginalUrl;
    }

    return '';
  }

  if (type.includes('voice') || type.includes('audio') || type === 'sound') {
    if (typeof msg.contentOriginalUrl === 'string' && msg.contentOriginalUrl) {
      return msg.contentOriginalUrl;
    }

    if (typeof msg.thumbnailOriginalUrl === 'string' && msg.thumbnailOriginalUrl) {
      return msg.thumbnailOriginalUrl;
    }

    return '';
  }

  if (type.includes('image') || type.includes('photo')) {
    if (typeof msg.contentOriginalUrl === 'string' && msg.contentOriginalUrl) {
      return msg.contentOriginalUrl;
    }

    if (typeof msg.thumbnailOriginalUrl === 'string' && msg.thumbnailOriginalUrl) {
      return msg.thumbnailOriginalUrl;
    }

    return '';
  }

  if (typeof msg.contentOriginalUrl === 'string' && msg.contentOriginalUrl) {
    return msg.contentOriginalUrl;
  }

  if (typeof msg.thumbnailOriginalUrl === 'string' && msg.thumbnailOriginalUrl) {
    return msg.thumbnailOriginalUrl;
  }

  return '';
}

export function getThumbnailUrl(msg: ChatMessage) {
  if (isDeletedMessage(msg)) return '';

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

export function getFallbackThumbnailUrl(msg: ChatMessage) {
  if (isDeletedMessage(msg)) return '';

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

  return getFallbackMediaUrl(msg);
}

export function getReplyPreview(msg: ChatMessage) {
  if (msg.mentionedMessageDeleted) return '삭제된 메시지입니다.';
  if (msg.mentionedMessageReported) return '신고된 메시지입니다.';
  if (msg.mentionedMessageContent) return msg.mentionedMessageContent;
  if (msg.mentionedMessageTranslatedMessage) return msg.mentionedMessageTranslatedMessage;

  if (msg.mentionedMessageEmoticonItem) return '';

  return '';
}

export function getKind(msg: ChatMessage) {
  if (isDeletedMessage(msg)) return 'deleted';

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
  if (isDeletedMessage(msg)) return '삭제된 메시지입니다.';

  const content = msg.content || msg.translatedMessage || '';

  if (msg.hasNick && content) {
    return `${fanNickname}${content}`;
  }

  return content;
}