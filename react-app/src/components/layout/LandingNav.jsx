import { Link } from 'react-router-dom';

export default function LandingNav() {
  return (
    <nav>
      <Link className="nav-logo" to="/">
        <img src="/assets/logo.png" alt="Logo" className="logo" />
        <div className="nav-logo-text">Delhi <span>Private</span><br />Tutors</div>
      </Link>
      <ul className="nav-links">
        <li><a href="#how-it-works">How It Works</a></li>
        <li><a href="#pricing">Pricing</a></li>
        <li><a href="#subjects">Subjects</a></li>
        <li><a href="#why-us">Why Us</a></li>
      </ul>
      <div className="nav-cta">
        <Link to="/login" className="btn-nav btn-nav-outline">Log In</Link>
        <Link to="/signup" className="btn-nav btn-nav-fill">Get Started</Link>
      </div>
    </nav>
  );
}
