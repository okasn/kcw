'use client';

import { useEffect, useRef, useState } from 'react';
import { Copy, Mail } from 'lucide-react';

const EMAIL = 'pupzei.cw@gmail.com';

export default function HomeContactMenu() {
  const menuRef = useRef<HTMLSpanElement>(null);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    }

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  });

  function openMenu() {
    setIsClosing(false);
    setOpen(true);
  }

  function closeMenu() {
    if (!open || isClosing) return;

    setIsClosing(true);

    window.setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
    }, 220);
  }

  function toggleMenu() {
    if (open) closeMenu();
    else openMenu();
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = EMAIL;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1600);
  }

  return (
    <span
      ref={menuRef}
      className={`homeContactMenu ${open ? 'isOpen' : ''} ${isClosing ? 'isClosing' : ''}`}
    >
      <button
        type="button"
        className="homeContactTrigger"
        onClick={toggleMenu}
      >
        이메일
      </button>

      {open && (
        <span className="homeContactPanel">
          <a
            className="homeContactAction"
            href={`mailto:${EMAIL}`}
          >
            <span className="homeContactIcon" aria-hidden="true">
              <Mail size={15} strokeWidth={1.8} />
            </span>

            <span>
              <strong>이메일 보내기</strong>
              <em>메일 앱으로 열기</em>
            </span>
          </a>

          <button
            type="button"
            className="homeContactAction"
            onClick={copyEmail}
          >
            <span className="homeContactIcon" aria-hidden="true">
              <Copy size={15} strokeWidth={1.8} />
            </span>

            <span>
              <strong>{copied ? '복사 완료' : '이메일 주소 복사하기'}</strong>
              <em>{EMAIL}</em>
            </span>
          </button>
        </span>
      )}
    </span>
  );
}