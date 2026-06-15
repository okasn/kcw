export default function ChatLoading() {
  return (
    <main className="page">
      <div className="mobileFrame">
        <section className="pageInner">
          <div className="skeleton pageSkeletonTitle" />

          <div className="skeletonToolbar">
            <div className="skeleton skeletonText" />
            <div className="skeleton skeletonPill" />
            <div className="skeleton skeletonCircle" />
          </div>

          <div className="skeletonGrid">
            {Array.from({ length: 8 }).map((_, index) => (
              <div className="skeletonCard" key={index}>
                <div className="skeleton skeletonThumb" />
                <div className="skeleton skeletonLine short" />
                <div className="skeleton skeletonLine" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}