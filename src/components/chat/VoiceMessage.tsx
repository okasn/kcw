'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';
import { formatDuration } from '@/lib/format';
import { getMediaUrl } from '@/lib/message';

function toSeconds(value: number | string | null | undefined) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.ceil(n)) : 0;
}

export default function VoiceMessage({ msg }: { msg: ChatMessage }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initial = toSeconds(msg.runningTime);

  const [duration, setDuration] = useState(initial);
  const [remaining, setRemaining] = useState(initial);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  const url = getMediaUrl(msg);

  useEffect(() => {
  function stopOtherVoice(event: Event) {
    const custom = event as CustomEvent<string>;

    if (custom.detail === msg.id) return;

    audioRef.current?.pause();
  }

  window.addEventListener('voice-play', stopOtherVoice);

  return () => {
    window.removeEventListener('voice-play', stopOtherVoice);
  };
}, [msg.id]);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio || !url) return;

    if (!audio.paused) {
      audio.pause();
      setPlaying(false);
      return;
    }

    setPlaying(true);
setLoading(true);

window.dispatchEvent(new CustomEvent('voice-play', { detail: msg.id }));

try {
  await audio.play();
    } catch (error) {
      setPlaying(false);
      const err = error as DOMException;
      if (err.name !== 'AbortError') console.error('audio play failed', error);
    } finally {
      setLoading(false);
    }
  }

  function handleLoadedMetadata() {
    const audio = audioRef.current;
    if (!audio) return;

    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      const next = Math.ceil(audio.duration);
      setDuration(next);
      setRemaining(next);
    }
  }

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio) return;

    const base =
      Number.isFinite(audio.duration) && audio.duration > 0
        ? audio.duration
        : duration;

    setRemaining(Math.max(0, Math.ceil(base - audio.currentTime)));
  }

  function handleEnded() {
    setPlaying(false);
    setRemaining(duration);
  }

  return (
    <div className={`voiceBubble ${playing ? 'isPlaying' : ''} ${loading ? 'isLoading' : ''}`}>
      <button
        className="voiceButton"
        type="button"
        onClick={toggle}
        aria-label={playing ? '일시정지' : '재생'}
      >
        {playing ? (
          <Pause size={23} fill="currentColor" strokeWidth={0} />
        ) : (
          <Play size={23} fill="currentColor" strokeWidth={0} />
        )}
      </button>

      <span className="voiceDuration">{formatDuration(remaining)}</span>

      {url && (
        <audio
  ref={audioRef}
  src={url}
  preload="none"
  onLoadedMetadata={handleLoadedMetadata}
  onTimeUpdate={handleTimeUpdate}
  onPlay={() => setPlaying(true)}
  onPause={() => setPlaying(false)}
  onEnded={handleEnded}
/>
      )}
    </div>
  );
}