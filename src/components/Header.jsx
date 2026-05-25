export default function Header() {
  return (
    <header className="site-header">
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

      <img
        src="/assets/Stemracing logo.png"
        alt="STEM Racing Saudi Arabia"
        className="site-header-partner"
      />
    </header>
  );
}
