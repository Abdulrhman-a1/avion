export default function OrbFallback() {
  return (
    <div className="orb-canvas orb-canvas--fallback" aria-hidden>
      <div className="orb-fallback">
        <span className="orb-fallback-ring" />
        <span className="orb-fallback-core" />
      </div>
    </div>
  );
}
