'use client';

import { useEffect, useState } from 'react';
import { preload } from 'react-dom';
import { formatKoreanTime } from '@/lib/format';
import { assetUrl } from '@/lib/cdn';
import { getKind, getReplyPreview } from '@/lib/message';
import { getProfileByDate } from '@/lib/profile';
import type { ChatMessage, Manifest } from '@/lib/types';
import type { LightboxItem } from '@/components/media/MediaLightbox';
import ProfileImageViewer from '@/components/profile/ProfileImageViewer';
import TextMessage from './TextMessage';
import MediaMessage from './MediaMessage';
import VoiceMessage from './VoiceMessage';

export default function MessageItem({
  msg,
  profile,
  mediaItems,
  mediaIndex = -1,
  isTarget = false,
}: {
  msg: ChatMessage;
  profile: Manifest['profile'];
  mediaItems?: LightboxItem[];
  mediaIndex?: number;
  isTarget?: boolean;
}) {
  const kind = getKind(msg);
  const currentProfile = getProfileByDate(profile, msg.createdAt);

  const avatarUrl = assetUrl(currentProfile.avatar);

  preload(avatarUrl, {
    as: 'image',
  });

  const [fanNickname, setFanNickname] = useState(currentProfile.fanNickname || '딸랑단');

  useEffect(() => {
    const savedNickname = localStorage.getItem('archiveNickname');
    setFanNickname(savedNickname?.trim() || currentProfile.fanNickname || '딸랑단');
  }, [currentProfile.fanNickname]);

  const hasRealReply =
    Boolean(msg.mentionedMessageID) ||
    Boolean(msg.mentionedMessageContent) ||
    Boolean(msg.mentionedMessageTranslatedMessage) ||
    Boolean(msg.mentionedMessageEmoticonItem) ||
    msg.mentionedMessageDeleted === true ||
    msg.mentionedMessageReported === true;

  return (
    <article
      className={`messageItem ${isTarget ? 'isTargetMessage' : ''}`}
      id={`msg-${msg.id}`}
    >
      <div className="avatar">
        <ProfileImageViewer
          src={avatarUrl}
          alt={currentProfile.artistNickname}
          name={currentProfile.artistNickname}
        />
      </div>

      <div className="messageBody">
        <div className="senderName">{currentProfile.artistNickname}</div>

        {hasRealReply && (
  <div className="replyPreview">
    <i />
    <p className={msg.mentionedMessageEmoticonItem ? 'hasEmoticon' : ''}>
      {msg.mentionedMessageEmoticonItem?.imageURL && (
        <img
          className="replyPreviewEmoticon"
          src={msg.mentionedMessageEmoticonItem.imageURL}
          alt=""
        />
      )}
      <span>{getReplyPreview(msg)}</span>
    </p>
  </div>
)}

        <div className="messageRow">
          {kind === 'audio' ? (
            <VoiceMessage msg={msg} />
          ) : kind === 'text' ? (
            <TextMessage msg={msg} fanNickname={fanNickname} />
          ) : (
            <MediaMessage
              msg={msg}
              kind={kind}
              mediaItems={mediaItems}
              mediaIndex={mediaIndex}
            />
          )}

          <span className="messageTime">{formatKoreanTime(msg.createdAt)}</span>
        </div>
      </div>
    </article>
  );
}