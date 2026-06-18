'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Moon, Sun } from 'lucide-react';

const NICKNAME_KEY = 'archiveNickname';
const DARKMODE_KEY = 'archiveDarkMode';

type Props = {
  defaultNickname: string;
};

export default function HomeQuickSettings({
  defaultNickname,
}: Props) {
  const [nickname, setNickname] = useState(defaultNickname);
  const [inputOpen, setInputOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [inputValue, setInputValue] = useState(defaultNickname);
  const [darkMode, setDarkMode] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  function showToast(message: string) {
    setToastMessage(message);

    window.setTimeout(() => {
      setToastMessage('');
    }, 1800);
  }

  function toggleNicknameEditor() {
    if (inputOpen) {
      setIsClosing(true);

      window.setTimeout(() => {
        setInputOpen(false);
        setIsClosing(false);
      }, 180);

      return;
    }

    setInputOpen(true);
  }

  function saveNickname() {
    const value = inputValue.trim() || defaultNickname;

    localStorage.setItem(
      NICKNAME_KEY,
      value
    );

    setNickname(value);
    setInputValue(value);
    setIsClosing(true);

    window.setTimeout(() => {
      setInputOpen(false);
      setIsClosing(false);
    }, 180);

    showToast('애칭이 저장되었어요.');
  }

  function submitNickname(e: FormEvent) {
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

    showToast(
      next
        ? '다크모드가 설정되었어요.'
        : '라이트모드가 설정되었어요.'
    );
  }

  return (
    <>
      <div className="homeQuickRow">
        <button
          type="button"
          className="homeQuickNickname"
          onClick={toggleNicknameEditor}
        >
          현재 애칭 · {nickname}
        </button>

        <button
          type="button"
          className={`homeQuickTheme ${
            darkMode ? 'isActive' : ''
          }`}
          onClick={toggleDarkMode}
          aria-label={darkMode ? '라이트모드 전환' : '다크모드 전환'}
        >
          {darkMode ? (
            <Sun size={16} strokeWidth={1.8} />
          ) : (
            <Moon size={16} strokeWidth={1.8} />
          )}
        </button>
      </div>

      {inputOpen && (
        <form
          className={`homeQuickEditor ${isClosing ? 'isClosing' : ''}`}
          onSubmit={submitNickname}
        >
          <input
            value={inputValue}
            onChange={(e) =>
              setInputValue(e.target.value)
            }
            placeholder="내 애칭 설정"
          />

          <button
            type="button"
            onClick={saveNickname}
          >
            저장
          </button>
        </form>
      )}

      {toastMessage && (
        <div className="appToast">
          {toastMessage}
        </div>
      )}
    </>
  );
}