'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, X } from 'lucide-react';

type ProfileImageViewerProps = {
  src: string;
  alt?: string;
  name?: string;
  className?: string;
};

function getFileName(src: string, name?: string) {
  const cleanName = (name?.trim() || 'profile')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/[\r\n]/g, '');

  const cleanSrc = src.split('?')[0];
  const originalName = cleanSrc.split('/').pop() || 'profile.jpg';

  const extension = originalName.includes('.')
    ? originalName.split('.').pop()
    : 'jpg';

  const baseName = originalName.replace(/\.[^/.]+$/, '');

  return `${cleanName}_${baseName}.${extension}`;
}

export default function ProfileImageViewer({
  src,
  alt = '',
  name = 'profile',
  className = '',
}: ProfileImageViewerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function downloadImage() {
    const filename = getFileName(src, name);

    const isInternalFile = src.startsWith('/');

    const href = isInternalFile
      ? src
      : `/api/download?url=${encodeURIComponent(src)}&filename=${encodeURIComponent(filename)}`;

    const anchor = document.createElement('a');

    anchor.href = href;
    anchor.download = filename;
    anchor.rel = 'noopener';

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  return (
    <>
      <button
        type="button"
        className={`profileImageTrigger ${className}`}
        onClick={() => setOpen(true)}
        aria-label="프로필 사진 크게 보기"
      >
        <img src={src} alt={alt} />
      </button>

      {mounted && open && createPortal(
        <div
          className="viewerOverlay profileViewerOverlay"
          onClick={() => setOpen(false)}
        >
          <div
            className="viewerShell profileViewerShell"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="viewerHeader profileViewerHeader">
              <button
                className="viewerIconBtn"
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
              >
                <X size={18} strokeWidth={1.8} />
              </button>

              <div className="viewerHeaderActions">
                <button
                  className="viewerIconBtn"
                  type="button"
                  onClick={downloadImage}
                  aria-label="프로필 사진 저장"
                >
                  <Download size={18} strokeWidth={1.8} />
                </button>
              </div>
            </header>

            <section className="viewerBody profileViewerBody">
              <img
                className="viewerObject profileViewerObject"
                src={src}
                alt={alt}
              />
            </section>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}