export default function SkeletonCard({ count = 3, className = 'skeleton-req-card' }) {
  return (
    <>
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className={`skeleton-base ${className}`} />
      ))}
    </>
  );
}
