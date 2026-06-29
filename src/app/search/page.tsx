import SiteNav from '@/components/layout/SiteNav';
import SearchClient from '@/components/search/SearchClient';

export default function SearchPage() {
  return (
    <main className="page">
      <div className="mobileFrame">
        <SiteNav />

        <section className="pageInner">
          <h1 className="pageTitle">검색</h1>
          <SearchClient />
        </section>
      </div>
    </main>
  );
}