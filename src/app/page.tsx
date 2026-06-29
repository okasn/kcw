import Link from 'next/link';
import SiteNav from '@/components/layout/SiteNav';
import HomeRecommendInfo from '@/components/home/HomeRecommendInfo';
import HeartStatsCard from '@/components/home/HeartStatsCard';
import ProfileImageViewer from '@/components/profile/ProfileImageViewer';
import HomeQuickSettings from '@/components/home/HomeQuickSettings';
import HomeContactMenu from '@/components/home/HomeContactMenu';
import { getManifest } from '@/lib/getManifest';
import { getDayGroups } from '@/lib/getArchiveData';
import { getKoreanNow } from '@/lib/format';
import { assetUrl } from '@/lib/cdn';
import { preload } from 'react-dom';
export const dynamic = 'force-dynamic';

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 9.1371C2 14 6.01943 16.5914 8.96173 18.9109C10 19.7294 11 20.5 12 20.5C13 20.5 14 19.7294 15.0383 18.9109C17.9806 16.5914 22 14 22 9.1371C22 4.27416 16.4998 0.825464 12 5.50063C7.50016 0.825464 2 4.27416 2 9.1371Z" />
    </svg>
  );
}

export default async function HomePage() {
  const manifest = await getManifest();
  const days = await getDayGroups();

  const { archive, profile } = manifest;

  const avatarPreloadList = Array.from(
    new Set([
      profile.defaultAvatar,
      '/profile/251227.jpeg',
      ...profile.avatars.map((avatar: { src: string }) => avatar.src),
    ].filter(Boolean))
  );

  for (const avatarSrc of avatarPreloadList) {
    preload(assetUrl(avatarSrc), {
      as: 'image',
    });
  }

  const today = getKoreanNow();
  const currentYear = today.getFullYear();

  const todayMonth = today.getMonth() + 1;
  const todayDate = today.getDate();

  const monthDay = `${String(todayMonth).padStart(2, '0')}-${String(
    todayDate
  ).padStart(2, '0')}`;

  function getDayNumber(date: string) {
    const [, month, day] = date.split('-').map(Number);
    return month * 31 + day;
  }

  const todayNumber = todayMonth * 31 + todayDate;

  const pastDays = days.filter((day) => Number(day.year) < currentYear);

  const sameDayMemories = pastDays
    .filter((day) => day.date.slice(5) === monthDay)
    .sort((a, b) => Number(a.year) - Number(b.year));

  const yearList = Array.from(new Set(pastDays.map((day) => day.year))).sort(
    (a, b) => Number(a) - Number(b)
  );

  const nearDayMemories = yearList
    .map((year) => {
      const yearDays = pastDays.filter((day) => day.year === year);

      return [...yearDays].sort((a, b) => {
        const aDistance = Math.abs(getDayNumber(a.date) - todayNumber);
        const bDistance = Math.abs(getDayNumber(b.date) - todayNumber);

        if (aDistance !== bDistance) return aDistance - bDistance;
        return a.date < b.date ? 1 : -1;
      })[0];
    })
    .filter(Boolean);

  const hasSameDayMemory = sameDayMemories.length > 0;
  const homeMemories = hasSameDayMemory ? sameDayMemories : nearDayMemories;

  return (
    <main className="page">
      <div className="mobileFrame">
        <SiteNav />

        <section className="pageInner">
          <section className="homeHero">
            <section className="homeDaysCard">
              <span>프롬친구와 함께한 날</span>

              <strong>
                <HeartIcon />
                +{archive.daysTogether}
              </strong>
            </section>

            <div className="homeWelcome">
              <div className="homeMessage">
                <ProfileImageViewer
                  src={assetUrl(profile.defaultAvatar)}
                  alt={profile.name}
                  name={profile.name}
                />
                <div>
                  <span>{profile.name}</span>
                  <p>
                    안녕하세요! 저 채원이에요 웨이브분들을 만나 뵙게 되어 기뻐요! 앞으로 좋은 추억 많이 쌓아요!
                  </p>
                </div>
              </div>

              <div className="homeMessage">
                <ProfileImageViewer
                  src={assetUrl('/profile/251227.jpeg')}
                  alt={profile.name}
                  name={profile.name}
                />
                <div>
                  <span>{profile.name}</span>
                  <p>마!! 왔나!!!! 환영한다 마!!!</p>
                </div>
              </div>
            </div>
          </section>

          {/* {homeMemories.length > 0 && (
            <section className="homeSameDayCard">
              <div className="homeSectionTitle">
                <span>오늘의 추천 메시지</span>
                <HomeRecommendInfo />
              </div>
              <div className="homeSameDayList">
                {homeMemories.map((day) => (
                  <Link href={`/chat/${day.date}`} className="homeSameDayItem" key={day.date}>
                    {day.thumbnail ? (
                      <img src={day.thumbnail} alt="" />
                    ) : (
                      <div className="homeSameDayEmpty">
                        <span>{day.shortDate}</span>
                      </div>
                    )}

                    <div>
                      <strong>{day.date.replaceAll('-', '.')}</strong>
                      <p>
                        메시지 {day.messageCount}
                        {day.imageCount ? ` · 사진 ${day.imageCount}` : ''}
                        {day.videoCount ? ` · 영상 ${day.videoCount}` : ''}
                        {day.audioCount ? ` · 음성 ${day.audioCount}` : ''}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )} */}

          <section className="homeNoticeCard">
            <div className="homeSectionTitle">
              <h2>공지</h2>
            </div>

            <div className="homeNoticeBody">
              <div className="homeNoticeLine">
                <p><span style={{ textDecoration: 'underline' }}><strong>악의적 사용을 금지합니다</strong></span></p>
              </div>
              
              <div className="homeNoticeLine">
                <p>2024.04.16 ~ 2026.06.30 백업</p>
              </div>

              <div className="homeNoticeLine">
                <p>
                  기본 애칭은 <strong>딸랑단</strong>입니다 변경 가능
                </p>
              </div>

              <div className="homeNoticeLine">
                <p>채팅 안의 사진은 클릭 후 저장해주세요</p>
              </div>

              <div className="homeNoticeLine">
                <p>메시지 내용으로 검색할 수 있어요</p>
              </div>

              <div className="homeNoticeLine homeContactLine">
                <div className="homeContactText">
                  <span>모든 문의는</span>
                  <HomeContactMenu />
                  <span>로 부탁드립니다</span>
                </div>
              </div>

            </div>
          </section>

          <HeartStatsCard />

          <HomeQuickSettings
            defaultNickname={archive.nickname}
          />

        </section>
      </div>
    </main>
  );
}