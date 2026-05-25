export default function Header() {
  return (
    <header className="site-header">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontFamily: "'Anton', sans-serif",
          letterSpacing: '2px',
          color: '#3BFAD2',
          textShadow: '0 0 18px rgba(59, 250, 210, 0.45)',
          fontSize: '22px',
        }}
      >
        <img
          src="/assets/Circl-Logo.png"
          alt="AVION"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            objectFit: 'cover',
            flexShrink: 0,
          }}
        />
        AVION
      </div>

      <img
        src="/assets/Stemracing logo.png"
        alt="STEM Racing Saudi Arabia"
        style={{ height: 32, opacity: 0.9 }}
      />
    </header>
  );
}
