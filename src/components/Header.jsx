export default function Header({ showBackToHome = false, onBackToHome }) {
  return (
    <header className="site-header">
      <div className="site-header-start">
        {showBackToHome && (
          <button
            type="button"
            className="home-back-btn home-back-btn--header"
            onClick={onBackToHome}
            aria-label="Back to home"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back to Home</span>
          </button>
        )}

        <div className="site-brand">
          <img
            src="/assets/Circl-Logo.png"
            alt="AVION"
            width={42}
            height={42}
            className="site-brand-logo"
          />
          <span className="site-brand-title">AVION</span>
        </div>
      </div>

      <img
        src="/assets/Stemracing logo.png"
        alt="STEM Racing Saudi Arabia"
        className="site-header-partner"
      />
    </header>
  );
}
