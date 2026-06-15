export type Manifest = {
  archive: {
    title: string;
    period: string;
    daysTogether: number;
    nickname: string;
    notice?: string;
  };
  profile: {
    name: string;
    defaultAvatar: string;
    defaultArtistNickname?: string;
    defaultFanNickname?: string;
    avatars: ProfileAvatar[];
  };
  months: MonthItem[];
};

export type ProfileAvatar = {
  from: string;
  to: string;
  src: string;
  artistNickname?: string;
  fanNickname?: string;
};

export type MonthItem = {
  id: string;
  label: string;
  file: string;
};

export type ChatMessage = {
  id: string;
  createdAt: string;
  updatedAt?: string;

  userType?: string;
  type?: string;

  hasNick?: boolean;

  content?: string | null;
  translatedMessage?: string | null;
  thumbnail?: string | null;

  runningTime?: number | string | null;

  emoticonItem?: Record<string, any> | null;

  existReply?: boolean;

  mentionedMessageID?: string | null;
  mentionedMessageUserID?: string | null;
  mentionedMessageContent?: string | null;
  mentionedMessageTranslatedMessage?: string | null;
  mentionedMessageDeleted?: boolean;
  mentionedMessageReported?: boolean;
  mentionedMessageEmoticonItem?: Record<string, any> | null;

  deleted?: boolean;
  isHidden?: boolean;
};