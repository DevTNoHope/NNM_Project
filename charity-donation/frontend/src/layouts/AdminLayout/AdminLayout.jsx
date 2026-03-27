import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../../components/NotificationBell/NotificationBell";
import logo from "../../../public/hopefund-logo.png";
import "./AdminLayout.css";

const AdminLayout = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path) => {
    return location.pathname === path || (path !== "/admin" && location.pathname.startsWith(path)) ? "active" : "";
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="admin-wrapper hope-theme">
      <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="admin-brand">
          <Link to="/admin">
            <span className="navbar__logo-icon">
              <img src={logo} alt="logo" />
            </span>
            <div className="brand-text">
              <h2>hope<span>Fund</span></h2>
              <span className="brand-subtitle">Charity Admin</span>
            </div>
          </Link>
        </div>

        <nav className="admin-nav">
          <ul>
            <li className={isActive("/admin")}>
              <Link to="/admin">
                <span className="nav-icon">⊞</span> <span className="nav-text">Dashboard</span>
              </Link>
            </li>
            <li className={isActive("/admin/projects/pending")}>
              <Link to="/admin/projects/pending">
                <span className="nav-icon">📁</span> <span className="nav-text">Projects</span>
              </Link>
            </li>
            <li className={isActive("/admin/categories")}>
              <Link to="/admin/categories">
                <span className="nav-icon">🗂️</span> <span className="nav-text">Categories</span>
              </Link>
            </li>
            <li className={isActive("/admin/users")}>
              <Link to="/admin/users">
                <span className="nav-icon">👤</span> <span className="nav-text">Users</span>
              </Link>
            </li>
            <li className={isActive("/admin/badges")}>
              <Link to="/admin/badges">
                <span className="nav-icon">🏅</span> <span className="nav-text">Badges</span>
            <li className={isActive("/admin/withdrawals")}>
              <Link to="/admin/withdrawals">
                <span className="nav-icon">💰</span> <span className="nav-text">Withdrawals</span>
              </Link>
            </li>
            <li style={{ marginTop: 'auto', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
              <Link to="/" style={{ color: '#4B5563' }}>
                <span className="nav-icon">🏠</span> <span className="nav-text">Back to Home</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* User Card in Sidebar (Moved to bottom) */}
        <div className="admin-user-card admin-user-card-bottom">
          <div className="avatar-img">
            <img src={`https://ui-avatars.com/api/?name=${user?.email || 'Admin'}&background=random&color=fff`} alt="Admin" />
          </div>
          <div className="user-info">
            <h4>{user?.email ? user.email.split('@')[0] : 'Admin'}</h4>
            <span>{user?.role || 'Administrator'}</span>
          </div>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={toggleSidebar}
              style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#6B7280', padding: '0.5rem' }}
            >
              ☰
            </button>
            <div className="header-search">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search donations, users, projects..." />
            </div>
          </div>
          <ul className="header-actions">
            <NotificationBell />
            <li className="help-icon">
              ❓
            </li>
          </ul>
        </header>

        <main className="admin-content">
          <div className="content-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
