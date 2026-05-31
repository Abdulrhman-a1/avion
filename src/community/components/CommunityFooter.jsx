import { Link } from 'react-router-dom';

export default function CommunityFooter() {
  return (
    <footer className="community-footer">
      <div className="community-footer-inner">
        <p className="community-footer-text">
          AVION Project Management Hub — learn, share, and grow with STEM Racing PMs.
        </p>
        <div className="community-footer-links">
          <Link to="/community/admin">Admin</Link>
          <Link to="/">Back to Nakhil</Link>
        </div>
      </div>
    </footer>
  );
}
