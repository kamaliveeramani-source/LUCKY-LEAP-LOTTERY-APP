function LotterySkeletonCard() {
  return (
    <div className="lottery-skeleton-card" aria-hidden="true">
      <div className="lottery-skeleton-image" />
      <div className="lottery-skeleton-header">
        <div className="lottery-skeleton-line lottery-skeleton-line--title" />
        <div className="lottery-skeleton-line lottery-skeleton-line--prize" />
      </div>
      <div className="lottery-skeleton-body">
        <div className="lottery-skeleton-line lottery-skeleton-line--meta" />
        <div className="lottery-skeleton-cta" />
      </div>
    </div>
  );
}

function LotteryListState({ status, onRetry, children }) {
  if (status === "loading") {
    return (
      <div className="lottery-grid-skeleton" aria-busy="true" aria-label="Loading lotteries">
        <LotterySkeletonCard />
        <LotterySkeletonCard />
        <LotterySkeletonCard />
        <LotterySkeletonCard />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="lottery-state-message">
        <p className="lottery-state-text">Could not load lotteries. Please try again.</p>
        <button type="button" className="btn btn-gradient-primary btn-pill lottery-state-retry" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="lottery-state-message">
        <p className="lottery-state-text">No lotteries available right now.</p>
      </div>
    );
  }

  return children;
}

export default LotteryListState;
