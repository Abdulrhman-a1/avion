import { Link, NavLink } from 'react-router-dom';

const navLinks = [
  { to: '/community', label: 'Home', end: true },
  { to: '/community/articles', label: 'Articles' },
  { to: '/community/courses', label: 'Courses' },
  { to: '/community/submit', label: 'Submit' },
];

export default function CommunityHeader() {
  return (
    <header className="site-header community-header">
      <div className="site-header-start">
        <Link to="/community" className="site-brand community-brand-link">
          <img
            src="/assets/Circl-Logo.png"
            alt="AVION"
            width={42}
            height={42}
            className="site-brand-logo"
          />
          <span className="site-brand-title">PM Hub</span>
        </Link>
        <nav className="community-nav" aria-label="Community navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `community-nav-link${isActive ? ' community-nav-link--active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="community-header-actions">
        <Link to="/" className="home-back-btn home-back-btn--header">
          Nakhil Chat
        </Link>
        <img
          src="/assets/Stemracing logo.png"
          alt="STEM Racing Saudi Arabia"
          className="site-header-partner"
        />
      </div>
    </header>
  );
}
