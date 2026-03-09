import { useState, useEffect, useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../utils/constants';
import { ThemeContext } from '../App';
import Button from './common/Button';
import './Navbar.css';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container">
        <nav className="navbar__inner">

          {/* Logo */}
          <Link to="/" className="navbar__logo" onClick={() => setMobileOpen(false)}>
            <span className="navbar__logo-icon">🌿</span>
            <span className="navbar__logo-text">HopeFund</span>
          </Link>

          {/* Desktop nav links */}
          <ul className="navbar__links">
            {NAV_LINKS.slice(0, 2).map(l => (
              <li key={l.path}>
                <NavLink
                  to={l.path}
                  className={({ isActive }) =>
                    `navbar__link ${isActive ? 'navbar__link--active' : ''}`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Desktop search bar — matches Figma */}
          <div className="navbar__search">
            <svg className="navbar__search-icon" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <span className="navbar__search-placeholder">Search</span>
          </div>

          {/* Desktop CTAs */}
          <div className="navbar__actions">
            <button
              className="navbar__theme"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <Button as={Link} to="/projects" variant="primary" size="sm">+ Create</Button>
            <Button as={Link} to="/" variant="outline" size="sm">Sign In</Button>
          </div>

          {/* Hamburger */}
          <button
            className="navbar__hamburger"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span className={`ham ${mobileOpen ? 'ham--open' : ''}`}>
              <span /><span /><span />
            </span>
          </button>
        </nav>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="navbar__mobile">
          <ul className="navbar__mobile-links">
            {NAV_LINKS.map(l => (
              <li key={l.path}>
                <NavLink
                  to={l.path}
                  className={({ isActive }) =>
                    `navbar__mobile-link ${isActive ? 'navbar__mobile-link--active' : ''}`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="navbar__mobile-actions">
            <button className="navbar__theme navbar__theme--mobile" onClick={toggleTheme}>
              {theme === 'light' ? '🌙' : '☀️'}&nbsp;
              {theme === 'light' ? 'Dark' : 'Light'} Mode
            </button>
            <Button as={Link} to="/projects" variant="primary" size="md" onClick={() => setMobileOpen(false)}>+ Create</Button>
            <Button as={Link} to="/" variant="outline" size="md" onClick={() => setMobileOpen(false)}>Sign In</Button>
          </div>
        </div>
      )}
    </header>
  );
};
export default Navbar;