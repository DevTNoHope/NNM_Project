import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { NAV_LINKS } from "../utils/constants";
import { ThemeContext } from "../App";
import { useDisconnect } from "wagmi";
import Button from "./common/Button";
import "./Navbar.css";

const shortenAddress = (address = "") => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const shortenEmail = (email = "") => {
  if (!email) return "";
  if (email.length <= 18) return email;

  const [name, domain] = email.split("@");
  if (!domain) return email;

  const shortName = name.length > 8 ? `${name.slice(0, 8)}...` : name;
  return `${shortName}@${domain}`;
};

const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState(getStoredUser());

  const { theme, toggleTheme } = useContext(ThemeContext);
  const { disconnectAsync } = useDisconnect();
  const navigate = useNavigate();
  const accountMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const syncUser = () => {
      setCurrentUser(getStoredUser());
    };

    syncUser();
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const accountLabel = useMemo(() => {
    if (!currentUser) return "";

    if (currentUser.email) {
      return shortenEmail(currentUser.email);
    }

    if (currentUser.linked_wallet) {
      return shortenAddress(currentUser.linked_wallet);
    }

    return "My Account";
  }, [currentUser]);

  const isLoggedIn = Boolean(currentUser);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("storage"));

      setCurrentUser(null);
      setAccountMenuOpen(false);

      try {
        await disconnectAsync();
      } catch {
        // ignore wallet disconnect errors for non-wallet login
      }

      setMobileOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleGoProfile = () => {
    setAccountMenuOpen(false);
    setMobileOpen(false);
    navigate("/profile");
  };

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="container">
        <nav className="navbar__inner">
          <Link
            to="/"
            className="navbar__logo"
            onClick={() => setMobileOpen(false)}
          >
            <span className="navbar__logo-icon">🌿</span>
            <span className="navbar__logo-text">HopeFund</span>
          </Link>

          <ul className="navbar__links">
            {NAV_LINKS.slice(0, 2).map((l) => (
              <li key={l.path}>
                <NavLink
                  to={l.path}
                  className={({ isActive }) =>
                    `navbar__link ${isActive ? "navbar__link--active" : ""}`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="navbar__search">
            <svg
              className="navbar__search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span className="navbar__search-placeholder">Search</span>
          </div>

          <div className="navbar__actions">
            <button
              className="navbar__theme"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            <Button as={Link} to="/projects" variant="primary" size="sm">
              + Create
            </Button>

            {isLoggedIn ? (
              <div className="navbar__account-menu">
                <button
                  type="button"
                  className="navbar__account"
                  title={accountLabel}
                >
                  <span className="navbar__account-label">{accountLabel}</span>
                </button>

                <div className="navbar__dropdown">
                  <button
                    type="button"
                    className="navbar__dropdown-item"
                    onClick={handleGoProfile}
                  >
                    Profile
                  </button>

                  <button
                    type="button"
                    className="navbar__dropdown-item"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Button as={Link} to="/signin" variant="outline" size="sm">
                Sign In
              </Button>
            )}
          </div>

          <button
            className="navbar__hamburger"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span className={`ham ${mobileOpen ? "ham--open" : ""}`}>
              <span />
              <span />
              <span />
            </span>
          </button>
        </nav>
      </div>

      {mobileOpen && (
        <div className="navbar__mobile">
          <ul className="navbar__mobile-links">
            {NAV_LINKS.map((l) => (
              <li key={l.path}>
                <NavLink
                  to={l.path}
                  className={({ isActive }) =>
                    `navbar__mobile-link ${
                      isActive ? "navbar__mobile-link--active" : ""
                    }`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="navbar__mobile-actions">
            <button
              className="navbar__theme navbar__theme--mobile"
              onClick={toggleTheme}
            >
              {theme === "light" ? "🌙" : "☀️"}&nbsp;
              {theme === "light" ? "Dark" : "Light"} Mode
            </button>

            <Button
              as={Link}
              to="/projects"
              variant="primary"
              size="md"
              onClick={() => setMobileOpen(false)}
            >
              + Create
            </Button>

            {isLoggedIn ? (
              <>
                <button
                  type="button"
                  className="navbar__account navbar__account--mobile"
                  onClick={handleGoProfile}
                >
                  {accountLabel}
                </button>
                <Button variant="outline" size="md" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button
                as={Link}
                to="/signin"
                variant="outline"
                size="md"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
