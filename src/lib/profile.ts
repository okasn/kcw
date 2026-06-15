import type { Manifest, ProfileAvatar } from './types';

function normalizeStart(value: string) {
  return value.includes('T') ? value : `${value}T00:00:00`;
}

function normalizeEnd(value: string) {
  return value.includes('T') ? value : `${value}T23:59:59`;
}

function findProfilePeriod(
  profile: Manifest['profile'],
  createdAt: string
): ProfileAvatar | undefined {
  const target = createdAt.slice(0, 19);

  return profile.avatars.find((item) => {
    const from = normalizeStart(item.from);
    const to = normalizeEnd(item.to);

    return target >= from && target <= to;
  });
}

export function getProfileByDate(
  profile: Manifest['profile'],
  createdAt: string
) {
  const matched = findProfilePeriod(profile, createdAt);

  return {
    avatar: matched?.src || profile.defaultAvatar,
    artistNickname:
      matched?.artistNickname ||
      profile.defaultArtistNickname ||
      profile.name,
    fanNickname:
      matched?.fanNickname ||
      profile.defaultFanNickname ||
      '딸랑단',
  };
}

export function getAvatarByDate(
  profile: Manifest['profile'],
  createdAt: string
) {
  return getProfileByDate(profile, createdAt).avatar;
}

export function getArtistNicknameByDate(
  profile: Manifest['profile'],
  createdAt: string
) {
  return getProfileByDate(profile, createdAt).artistNickname;
}

export function getFanNicknameByDate(
  profile: Manifest['profile'],
  createdAt: string
) {
  return getProfileByDate(profile, createdAt).fanNickname;
}