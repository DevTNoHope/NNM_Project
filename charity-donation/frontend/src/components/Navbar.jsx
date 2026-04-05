import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useContext, useMemo } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { NAV_LINKS } from "@/utils/constants";
import { ThemeContext } from "@/App";
import { useDisconnect } from "wagmi";
import Button from "@/components/common/Button";
import NotificationBell from "@/components/NotificationBell/NotificationBell";
const logo = "/hopefund-logo.png";
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
  const { user, logout } = useAuth();
  const { disconnectAsync } = useDisconnect();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      return;
    }

    setCurrentUser(getStoredUser());
  }, [user]);

  useEffect(() => {
    const syncUser = () => setCurrentUser(getStoredUser());

    window.addEventListener("storage", syncUser);
    window.addEventListener("auth-changed", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("auth-changed", syncUser);
    };
  }, []);

  const accountLabel = useMemo(() => {
    if (!currentUser) return "";

    if (currentUser.email) return shortenEmail(currentUser.email);
    if (currentUser.linked_wallet)
      return shortenAddress(currentUser.linked_wallet);
    if (currentUser.walletAddress)
      return shortenAddress(currentUser.walletAddress);
    if (currentUser.address) return shortenAddress(currentUser.address);

    return "My Account";
  }, [currentUser]);

  const isLoggedIn = Boolean(currentUser);

  const handleLogout = async () => {
    try {
      if (logout) await logout();

      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-changed"));

      setCurrentUser(null);

      try {
        await disconnectAsync();
      } catch { }

      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="container">
        <nav className="navbar__inner">
          <Link to="/" className="navbar__logo">
            <span className="navbar__logo-icon">
              <img src={logo} alt="logo" />
            </span>
            <span className="navbar__logo-text">HopeFund</span>
          </Link>

          <ul className="navbar__links">
            {NAV_LINKS.map((l) => (
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

          <form
            className="navbar__search"
            onSubmit={(e) => {
              e.preventDefault();
              const q = e.target.search.value;
              if (q.trim()) navigate(`/projects?search=${encodeURIComponent(q.trim())}`);
            }}
          >
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
            <input
              type="text"
              name="search"
              className="navbar__search-input"
              placeholder="Search"
              autoComplete="off"
              style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', width: '100%' }}
            />
          </form>

          <div className="navbar__actions">
            <button
              className="navbar__theme"
              onClick={toggleTheme}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            <Button as={Link} to="/my-projects/create" variant="primary" size="sm">
              + Create
            </Button>

            {isLoggedIn ? (
              <>
                <ul style={{ margin: 0, padding: 0, display: "flex", alignItems: "center" }}>
                  <NotificationBell />
                </ul>
                <div className="navbar__account-menu">
                  <button type="button" className="navbar__account">
                    <span className="navbar__account-label">{accountLabel}</span>
                    <span className="navbar__account-caret">▾</span>
                  </button>

                  <div className="navbar__dropdown">
                    <button
                      className="navbar__dropdown-item"
                      onClick={() => navigate("/profile")}
                    >
                      Profile
                    </button>

                    <button
                      className="navbar__dropdown-item"
                      onClick={() => navigate("/my-projects")}
                    >
                      My Projects
                    </button>

                    <button
                      type="button"
                      className="navbar__dropdown-item navbar__logout-btn"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
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
            ☰
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
