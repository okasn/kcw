import SiteNav from '@/components/layout/SiteNav';
import SettingClient from '@/components/setting/SettingClient';

export default function SettingPage() {
  return (
    <main className="page">
      <div className="mobileFrame">
        <SiteNav />

        <section className="pageInner">
          <h1 className="pageTitle">설정</h1>

          <SettingClient />
        </section>
      </div>
    </main>
  );
}