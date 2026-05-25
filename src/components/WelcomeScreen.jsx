import { lazy, Suspense } from 'react';
import { useDeferredMount } from '../hooks/useDeferredMount';
import OrbFallback from './OrbFallback';
import CardArt from './CardArt';

const CarModel = lazy(() => import('./CarModel'));

const categories = [
  {
    id: 'Enterprise',
    chip: 'chip-blue',
    chipLabel: 'Enterprise',
    description: 'Community, SDGs & outreach activities',
    glow: 'card-glow-blue',
    artTone: 'enterprise',
  },
  {
    id: 'Engineering',
    chip: 'chip-pink',
    chipLabel: 'Engineering',
    description: 'Car design, CFD & manufacturing',
    glow: 'card-glow-pink',
    artTone: 'engineering',
  },
  {
    id: 'Project Management',
    chip: 'chip-green',
    chipLabel: 'Project Management',
    description: 'Planning, budget & scheduling',
    glow: 'card-glow-green',
    artTone: 'management',
  },
];

export default function WelcomeScreen({ onSelectCategory, isResponding }) {
  const showModel = useDeferredMount({ idleTimeoutMs: 2000 });

  return (
    <div className="welcome-layout">
      <div className="welcome-split">
        <section className="hero">
          <h1 className="hero-title">
            <span className="hero-line">How can</span>
            <span className="hero-line"><span className="accent">Nakhil</span></span>
            <span className="hero-line">help you?</span>
          </h1>
        </section>

        <div className="orb-wrap">
          <div className="orb">
            {showModel ? (
              <Suspense fallback={<OrbFallback />}>
                <CarModel isTyping={isResponding} presentation="welcome" />
              </Suspense>
            ) : (
              <OrbFallback />
            )}
          </div>
        </div>
      </div>

      <section className="cards-section grid grid-cols-1 gap-4 min-[861px]:grid-cols-3 min-[861px]:gap-5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className="action-card"
            onClick={() => onSelectCategory(cat.id)}
          >
            <span className={`chip ${cat.chip}`}>{cat.chipLabel}</span>
            <p className="card-desc">{cat.description}</p>
            <CardArt category={cat.id} tone={cat.artTone} />
            <div className={`card-glow ${cat.glow}`} aria-hidden />
          </button>
        ))}
      </section>
    </div>
  );
}
