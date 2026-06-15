export default function GalleryLoading() {
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

          <div className="gallerySkeletonGrid">
            {Array.from({ length: 12 }).map((_, index) => (
              <div className="skeleton gallerySkeletonItem" key={index} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}