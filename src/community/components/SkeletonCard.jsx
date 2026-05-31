export function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-line skeleton-cover" />
      <div className="skeleton-line skeleton-chip" />
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line skeleton-title skeleton-title--short" />
      <div className="skeleton-line skeleton-meta" />
      <div className="skeleton-line skeleton-text" />
      <div className="skeleton-line skeleton-text skeleton-text--short" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }) {
  return (
    <div className="community-grid" aria-label="Loading…">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="skeleton-detail" aria-label="Loading…" aria-hidden="true">
      <div className="skeleton-line skeleton-detail-cover" />
      <div className="skeleton-line skeleton-chip" />
      <div className="skeleton-line skeleton-detail-title" />
      <div className="skeleton-line skeleton-detail-title skeleton-detail-title--short" />
      <div className="skeleton-line skeleton-meta" style={{ marginBottom: '2rem' }} />
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="skeleton-line skeleton-text" style={{ width: `${75 + Math.sin(i) * 20}%` }} />
      ))}
    </div>
  );
}

export function SkeletonAdminRows({ count = 4 }) {
  return (
    <div className="skeleton-admin-rows" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton-admin-row">
          <div style={{ flex: 1 }}>
            <div className="skeleton-line skeleton-title" style={{ width: '60%', marginBottom: 8 }} />
            <div className="skeleton-line skeleton-meta" style={{ width: '35%' }} />
          </div>
          <div className="skeleton-line skeleton-chip" style={{ width: 70 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="skeleton-line" style={{ width: 60, height: 28, borderRadius: 6 }} />
            <div className="skeleton-line" style={{ width: 60, height: 28, borderRadius: 6 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
