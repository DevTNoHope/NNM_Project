import { useState, useEffect, useContext, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { NAV_LINKS } from '../utils/constants';
import { ThemeContext } from '../App';
import { useAuth } from '../context/AuthContext';
import Button from './common/Button';
import './Navbar.css';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
            {user ? (
              <div className="navbar__user-menu" ref={dropdownRef}>
                <button
                  className="navbar__avatar-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                >
                  <div className="navbar__avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.email} />
                    ) : (
                      <span>{(user.name || user.email || 'U').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </button>
                {dropdownOpen && (
                  <div className="navbar__dropdown">
                    <div className="navbar__dropdown-header">
                      <p className="navbar__dropdown-name">{user.name || user.email.split('@')[0]}</p>
                      <p className="navbar__dropdown-email">{user.email}</p>
                    </div>
                    <ul className="navbar__dropdown-list">
                      <li><Link to="/profile" onClick={() => setDropdownOpen(false)}>My Profile</Link></li>
                      <li><Link to="/my-donations" onClick={() => setDropdownOpen(false)}>My Donations</Link></li>
                      <li className="navbar__dropdown-divider"></li>
                      <li><button onClick={handleLogout} className="navbar__logout-btn">Logout</button></li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <Button as={Link} to="/signin" variant="outline" size="sm">Sign In</Button>
            )}
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
            {user ? (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ padding: '12px', background: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="navbar__avatar">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.email} />
                    ) : (
                      <span>{(user.name || user.email || 'U').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: 'var(--color-text)' }}>{user.name || user.email.split('@')[0]}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.email}</p>
                  </div>
                </div>
                <Link to="/profile" className="navbar__mobile-dropdown-link" onClick={() => setMobileOpen(false)}>My Profile</Link>
                <Link to="/my-donations" className="navbar__mobile-dropdown-link" onClick={() => setMobileOpen(false)}>My Donations</Link>
                <button className="navbar__mobile-dropdown-link navbar__mobile-logout" onClick={() => { handleLogout(); setMobileOpen(false); }}>Logout</button>
              </div>
            ) : (
              <Button as={Link} to="/signin" variant="outline" size="md" onClick={() => setMobileOpen(false)}>Sign In</Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
export default Navbar;