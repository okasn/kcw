'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import GalleryClient from '@/components/gallery/GalleryClient';
import VoicesClient from '@/components/voices/VoicesClient';

export default function MediaClient({
  galleryItems,
  voices,
}: {
  galleryItems: any[];
  voices: any[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'gallery' | 'voice'>('gallery');

  useEffect(() => {
    const currentTab = searchParams.get('tab');

    if (currentTab === 'voice') {
      setTab('voice');
    } else {
      setTab('gallery');
    }
  }, [searchParams]);

  function changeTab(nextTab: 'gallery' | 'voice') {
    setTab(nextTab);
    router.replace(`/media?tab=${nextTab}`, { scroll: false });
  }

  return (
    <>
      <div className="mediaTabs">
        <button
          className={tab === 'gallery' ? 'isActive' : ''}
          onClick={() => changeTab('gallery')}
        >
          사진·영상
        </button>

        <button
          className={tab === 'voice' ? 'isActive' : ''}
          onClick={() => changeTab('voice')}
        >
          음성메시지
        </button>
      </div>

      {tab === 'gallery' ? (
        <GalleryClient items={galleryItems} />
      ) : (
        <VoicesClient voices={voices} />
      )}
    </>
  );
}