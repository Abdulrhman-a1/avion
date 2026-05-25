const arts = {
  Enterprise: (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden>
      <circle cx="58" cy="42" r="22" stroke="currentColor" strokeWidth="2.2" opacity="0.9" />
      <path d="M58 28v6M58 50v6M44 42h-6M72 42h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M48 34l-4-4M68 34l4-4M48 50l-4 4M68 50l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      <path d="M28 88c8-10 18-15 30-15s22 5 30 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="38" cy="78" r="7" stroke="currentColor" strokeWidth="2" />
      <circle cx="58" cy="72" r="7" stroke="currentColor" strokeWidth="2" />
      <circle cx="78" cy="78" r="7" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  Engineering: (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden>
      <path
        d="M62 18l8 4v12l-8 5-8-5V22l8-4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M24 78h52l6 18H18l6-18z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="38" cy="92" r="7" stroke="currentColor" strokeWidth="2" />
      <circle cx="62" cy="92" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M78 34c9 0 16 7 16 16s-7 16-16 16"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M78 34v-8M78 66v8M66 50h-8M90 50h8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.75"
      />
      <circle cx="78" cy="50" r="5" fill="currentColor" opacity="0.35" />
    </svg>
  ),
  'Project Management': (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden>
      <rect x="22" y="26" width="68" height="58" rx="8" stroke="currentColor" strokeWidth="2.2" />
      <path d="M22 40h68" stroke="currentColor" strokeWidth="2" />
      <path d="M36 26v-8M58 26v-8M80 26v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M34 54h18M34 66h28M34 78h22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M78 52l6 6-14 14-8-8 6-6 6 6z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  ),
};

export default function CardArt({ category, tone }) {
  return (
    <div className={`card-art card-art-${tone}`} aria-hidden>
      {arts[category]}
    </div>
  );
}
