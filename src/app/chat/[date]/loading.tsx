export default function ChatDateLoading() {
  return (
    <main className="page">
      <div className="mobileFrame">
        <section className="chatDetail">
          <div className="chatScreen">
            <div className="chatSkeletonDate skeleton" />

            {Array.from({ length: 9 }).map((_, index) => (
              <div className="chatSkeletonMessage" key={index}>
                <div className="skeleton chatSkeletonAvatar" />

                <div className="chatSkeletonBody">
                  <div className="skeleton chatSkeletonName" />

                  <div
                    className={`skeleton chatSkeletonBubble ${
                      index % 3 === 0 ? 'long' : index % 3 === 1 ? 'short' : ''
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}