export default function VoicesLoading() {
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

          <div className="voiceSkeletonGrid">
            {Array.from({ length: 10 }).map((_, index) => (
              <div className="voiceSkeletonCard" key={index}>
                <div className="skeleton skeletonLine short" />
                <div className="skeleton voiceSkeletonBubble" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}