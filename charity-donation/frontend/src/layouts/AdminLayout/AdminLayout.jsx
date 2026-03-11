import { Outlet, Link, useLocation } from "react-router-dom";
import "./AdminLayout.css";

const AdminLayout = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.startsWith(path) ? "active" : "";
  };

  return (
    <div className="admin-wrapper hope-theme">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Link to="/admin">
            <h2>hope<span>Fund</span></h2>
          </Link>
        </div>
        
        {/* User Card in Sidebar */}
        <div className="admin-user-card">
          <div className="avatar-img">
            <img src="https://ui-avatars.com/api/?name=Admin&background=random&color=fff" alt="Admin" />
          </div>
          <div className="user-info">
            <h4>Admin hopeFund</h4>
            <div className="social-icons">
              <span>f</span>
              <span>in</span>
              <span>g</span>
            </div>
          </div>
        </div>

        <nav className="admin-nav">
          <ul>
            <li className={isActive("/admin/dashboard") || location.pathname === "/admin" ? "active" : ""}>
              <Link to="/admin">
                <i className="icon-dashboard"></i> Dashboard
              </Link>
            </li>
            <li className="nav-title">RESOURCE MANAGEMENT</li>
            <li className={isActive("/admin/projects/pending") ? "active" : ""}>
              <Link to="/admin/projects/pending">
                <i className="icon-list"></i> All Projects
              </Link>
            </li>
            <li className={isActive("/admin/categories") ? "active" : ""}>
              <Link to="/admin/categories">
                <i className="icon-layers"></i> Categories
              </Link>
            </li>
            <li className={isActive("/admin/users") ? "active" : ""}>
              <Link to="/admin/users">
                <i className="icon-user"></i> Users
              </Link>
            </li>
            <li className="nav-title">SYSTEM</li>
            <li>
              <a href="http://localhost:5173/">
                <i className="icon-home"></i> Back to Home
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div className="header-search">
            <input type="text" placeholder="Search..." />
            <button>🔍</button>
          </div>
          <ul className="header-user">
            <li className="notification-icon">
              🔔<span className="badge-dot"></span>
            </li>
            <li className="profile-dropdown">
              <span>admin@hopefund.com</span>
              <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Admin" />
            </li>
          </ul>
        </header>

        <main className="admin-content">
          <div className="breadcrumb-wrapper">
             <div className="welcome-text">
                <img src="/vite.svg" alt="logo" className="welcome-logo"/>
                <div>
                   <p>Welcome back to,</p>
                   <h3>hopeFund Dashboard</h3>
                </div>
             </div>
          </div>
          <div className="content-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
