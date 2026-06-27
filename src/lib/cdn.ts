export const CDN_ORIGIN = 'https://cdn.kcws21.kr';

const CDN_ENABLED = {
  profile: true,
  emoticons: false,
  voices: false,
  videos: false,
  images: false,
  data: false,
};

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//.test(url);
}

export function assetUrl(path: string) {
  if (!path) return path;
  if (isAbsoluteUrl(path)) return path;

  if (CDN_ENABLED.profile && path.startsWith('/profile/')) {
    return `${CDN_ORIGIN}${path}`;
  }

  if (CDN_ENABLED.emoticons && path.startsWith('/emoticons/')) {
    return `${CDN_ORIGIN}${path}`;
  }

  if (CDN_ENABLED.voices && path.startsWith('/voices/')) {
    return `${CDN_ORIGIN}${path}`;
  }

  if (CDN_ENABLED.videos && path.startsWith('/videos/')) {
    return `${CDN_ORIGIN}${path}`;
  }

  if (CDN_ENABLED.images && path.startsWith('/images/')) {
    return `${CDN_ORIGIN}${path}`;
  }

  if (CDN_ENABLED.data && path.startsWith('/data/')) {
    return `${CDN_ORIGIN}${path}`;
  }

  return path;
}