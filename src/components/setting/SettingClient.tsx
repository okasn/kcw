'use client';

import { useEffect, useState } from 'react';
import { MoonStar, UserRound } from 'lucide-react';

const NICKNAME_KEY = 'archiveNickname';
const DARKMODE_KEY = 'archiveDarkMode';

export default function SettingClient() {
  const [nickname, setNickname] = useState('');
  const [savedNickname, setSavedNickname] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    const savedNickname =
      localStorage.getItem(NICKNAME_KEY) || '';

    const savedDarkMode =
      localStorage.getItem(DARKMODE_KEY) === 'true';

    setNickname(savedNickname);
    setSavedNickname(savedNickname);
    setDarkMode(savedDarkMode);

    document.documentElement.dataset.theme =
      savedDarkMode ? 'dark' : 'light';
  }, []);

  function saveNickname() {
    const value = nickname.trim();

    localStorage.setItem(NICKNAME_KEY, value);
    setNickname(value);
    setSavedNickname(value);
    setToastOpen(true);
    navigator.vibrate?.(20);

    window.setTimeout(() => {
      setToastOpen(false);
    }, 1800);
  }

  function submitNickname(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    saveNickname();
  }

  function toggleDarkMode() {
    const next = !darkMode;

    setDarkMode(next);

    localStorage.setItem(
      DARKMODE_KEY,
      String(next)
    );

    document.documentElement.dataset.theme =
      next ? 'dark' : 'light';
  }

  return (
    <div className="settingList">
      <section className="settingCard">
        <div className="settingHead">
          <UserRound size={16} />
          <span>애칭 변경</span>
        </div>

        <p>
          채팅에 표시될 내 애칭을 변경합니다.
        </p>

        <form className="settingNicknameForm" onSubmit={submitNickname}>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="애칭 입력"
          />

          <button
            type="submit"
            disabled={nickname.trim() === savedNickname.trim()}
          >
            저장
          </button>
        </form>
      </section>

      {toastOpen && (
        <div className="settingToast">
          애칭이 저장되었어요.
        </div>
      )}
    </div>
  );
}
