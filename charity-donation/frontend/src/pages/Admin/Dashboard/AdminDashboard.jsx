import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";
import http from "../../../api/http";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: { total: 0 },
    projects: { total: 0, pending: 0 },
    donations: { totalCount: 0, totalAmount: 0 }
  });
  const [recentPending, setRecentPending] = useState([]);
  const [featureWidgets, setFeatureWidgets] = useState({
    topProject: null,
    almostCompleted: [],
    needsSupport: []
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch stats
      const statsRes = await http.get('/admin/dashboard');
      const statsData = statsRes.data;
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Fetch projects
      const projRes = await http.get('/admin/projects');
      const projData = projRes.data;
      if (projData.success && projData.data) {
        const projects = projData.data;

        // Filter pending and get top 4
        const pending = projects.filter(p => p.status === 'PENDING').slice(0, 4);
        setRecentPending(pending);

        // Feature Widgets Data
        const activeProjects = projects.filter(p => p.status === 'APPROVED' || p.status === 'ACTIVE' || p.status === 'PUBLISHED');

        // Top Funded
        let topProject = null;
        if (activeProjects.length > 0) {
          topProject = activeProjects.reduce((max, p) => parseFloat(p.total_donated || 0) > parseFloat(max.total_donated || 0) ? p : max, activeProjects[0]);
        }

        // Almost Completed (>70% funded, but not 100%)
        const almostCompleted = activeProjects
          .filter(p => {
             const raised = parseFloat(p.total_donated || 0);
             const goal = parseFloat(p.goal_amount || 0);
             return goal > 0 && raised >= goal * 0.7 && raised < goal;
          })
          .sort((a, b) => (parseFloat(b.total_donated || 0) / parseFloat(b.goal_amount || 1)) - (parseFloat(a.total_donated || 0) / parseFloat(a.goal_amount || 1)))
          .slice(0, 3);

        // Needs Support ($0 or <20% funded)
        const needsSupport = activeProjects
          .filter(p => {
             const raised = parseFloat(p.total_donated || 0);
             const goal = parseFloat(p.goal_amount || 0);
             return raised === 0 || (goal > 0 && raised < goal * 0.2);
          })
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3);

        setFeatureWidgets({
          topProject,
          almostCompleted,
          needsSupport
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (projectId, action) => {
    const endpoint = action === 'APPROVE' 
      ? `/admin/projects/${projectId}/approve`
      : `/admin/projects/${projectId}/reject`;

    try {
      const res = await http.post(endpoint, { note: `Action taken from dashboard` });
      const data = res.data;
      if (data.success) {
        fetchData(); // Refresh data
      } else {
        alert("Error occurred: " + data.message);
      }
    } catch (error) {
      alert("Server connection error.");
      console.error(error);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header-text">
        <h2>Dashboard Overview</h2>
        <p>Welcome back, here's what's happening with HopeFund today.</p>
      </div>

      <div className="widget-row">
        {/* Widget 1 - Total Donations */}
        <div className="widget-card">
          <div className="widget-card-top">
            <div className="widget-icon-box" style={{backgroundColor: '#f3efff', color: '#7C4DFF'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
                <rect x="6" y="8" width="12" height="8" rx="2" fill="currentColor" fillOpacity="0.5"/>
              </svg>
            </div>
            <div className="widget-trend positive">+12% ↗</div>
          </div>
          <div className="widget-content">
            <div className="widget-subtitle">Total Donations</div>
            <div className="widget-title">
              {loading ? '...' : `$${(stats.donations.totalAmount).toLocaleString()}`}
            </div>
          </div>
        </div>

        {/* Widget 2 - Active Projects */}
        <div className="widget-card">
          <div className="widget-card-top">
            <div className="widget-icon-box" style={{backgroundColor: '#e6f7ef', color: '#2ed573'}}>
               <svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            </div>
            <div className="widget-trend positive">+5% ↗</div>
          </div>
          <div className="widget-content">
            <div className="widget-subtitle">Active Projects</div>
            <div className="widget-title">{loading ? '...' : stats.projects.total}</div>
          </div>
        </div>

        {/* Widget 3 - Pending Approvals */}
        <div className="widget-card">
          <div className="widget-card-top">
            <div className="widget-icon-box" style={{backgroundColor: '#f3efff', color: '#7C4DFF'}}>
              <svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
            </div>
            <div className="widget-trend warning">15 Pending</div>
          </div>
          <div className="widget-content">
            <div className="widget-subtitle">Pending Approvals</div>
            <div className="widget-title">{loading ? '...' : stats.projects.pending}</div>
          </div>
        </div>

        {/* Widget 4 - Total Users */}
        <div className="widget-card">
          <div className="widget-card-top">
            <div className="widget-icon-box" style={{backgroundColor: '#f6f3ff', color: '#a55eea'}}>
               <svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            </div>
             <div className="widget-trend positive">+8% ↗</div>
          </div>
          <div className="widget-content">
             <div className="widget-subtitle">Total Users</div>
            <div className="widget-title">{loading ? '...' : stats.users.total.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Feature Widgets Row */}
      {!loading && (
        <div className="feature-widgets-row">
          {/* Top Funded Project */}
          <div className="feature-widget-card highlight-card">
            <div className="feature-widget-header">
               <span className="fw-icon text-warning">🏆</span> TOP FUNDED PROJECT
            </div>
            {featureWidgets.topProject ? (
               <div className="fw-body top-funded">
                  <div className="tf-image-wrapper">
                     <img src={featureWidgets.topProject.cover_image_url || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&q=80'} alt={featureWidgets.topProject.title} className="tf-image" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&q=80' }} />
                     <span className="tf-category">{featureWidgets.topProject.category_name || 'Community'}</span>
                  </div>
                  <h3 className="tf-title">{featureWidgets.topProject.title}</h3>
                  <p className="tf-desc">{featureWidgets.topProject.description?.substring(0, 70) || 'Providing support and infrastructure...'}...</p>
                  
                  <div className="tf-progress-section">
                     <div className="tf-progress-labels">
                        <span className="text-secondary">Raised</span>
                        <span className="tf-raised-val text-primary-purple font-bold">${parseFloat(featureWidgets.topProject.total_donated || 0).toLocaleString()}</span>
                     </div>
                     <div className="tf-progress-bar-bg">
                        <div className="tf-progress-bar-fill bg-primary-purple" style={{width: `${Math.min(100, (parseFloat(featureWidgets.topProject.total_donated || 0) / Math.max(1, parseFloat(featureWidgets.topProject.goal_amount || 1))) * 100)}%`}}></div>
                     </div>
                     <div className="tf-goal-label">Goal: ${parseFloat(featureWidgets.topProject.goal_amount || 0).toLocaleString()}</div>
                  </div>
               </div>
            ) : (
               <div className="fw-empty">No active projects found</div>
            )}
          </div>

          {/* Almost Completed */}
          <div className="feature-widget-card">
            <div className="feature-widget-header">
               <span className="fw-icon text-success">✅</span> ALMOST COMPLETED
            </div>
            <div className="fw-body list-widget">
               <div className="fw-list-container">
                 {featureWidgets.almostCompleted.length > 0 ? (
                     featureWidgets.almostCompleted.map(p => {
                       const percent = Math.min(100, (parseFloat(p.total_donated || 0) / Math.max(1, parseFloat(p.goal_amount || 1))) * 100).toFixed(0);
                       const left = parseFloat(p.goal_amount || 0) - parseFloat(p.total_donated || 0);
                       return (
                          <div key={p.id} className="ac-item">
                             <div className="ac-item-header">
                                <h4 className="ac-title">{p.title}</h4>
                                <span className="ac-left-val text-success font-semibold">${left.toLocaleString()} left</span>
                             </div>
                             <div className="ac-item-meta text-secondary">{p.category_name || 'Environment'} • {percent}% Funded</div>
                             <div className="tf-progress-bar-bg small">
                                <div className="tf-progress-bar-fill bg-success" style={{width: `${percent}%`}}></div>
                             </div>
                          </div>
                       );
                    })
                 ) : (
                    <div className="fw-empty">No almost completed projects</div>
                 )}
               </div>
               {featureWidgets.almostCompleted.length > 0 && (
                  <button className="btn-outline-full mt-auto">View More Near Completion</button>
               )}
            </div>
          </div>

          {/* Needs Support */}
          <div className="feature-widget-card">
            <div className="feature-widget-header">
               <span className="fw-icon text-danger">❗</span> NEEDS SUPPORT
            </div>
            <div className="fw-body list-widget d-flex-column">
               <div className="fw-list-container flex-grow-1">
                 {featureWidgets.needsSupport.length > 0 ? (
                    featureWidgets.needsSupport.map(p => {
                       return (
                          <div key={p.id} className="ns-item">
                             <div className="ns-icon-wrapper">
                                <svg width="22" height="22" fill="#9CA3AF" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM13.96 12.29l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z"/></svg>
                             </div>
                             <div className="ns-item-content">
                                <h4 className="ns-title">{p.title}</h4>
                                <div className="ns-meta">
                                   <span className="ns-raised-badge text-danger bg-danger-light font-semibold">${parseFloat(p.total_donated || 0).toLocaleString()} raised</span>
                                   <span className="ns-created-date text-secondary ms-2">Goal: ${parseFloat(p.goal_amount || 0).toLocaleString()}</span>
                                </div>
                             </div>
                          </div>
                       );
                    })
                 ) : (
                    <div className="fw-empty">All projects are well supported!</div>
                 )}
               </div>
               <button className="btn-primary-full mt-auto mb-0">Create Promo Feature</button>
            </div>
          </div>
        </div>
      )}

       {/* Donation Trends Chart */}
      <div className="admin-card chart-card">
        <div className="admin-card-header chart-header">
           <div>
              <div className="chart-title">Donation Trends</div>
              <div className="chart-subtitle">Daily contributions over the last 30 days</div>
           </div>
          <div className="chart-actions-pills">
            <button className="active">Last 30 Days</button>
            <button>Last 6 Months</button>
          </div>
        </div>
        <div className="admin-card-body chart-body">
          <div className="mock-chart-graphic style-v2">
            <svg width="100%" height="250" preserveAspectRatio="none">
               {/* Grid */}
               <line x1="0" y1="50" x2="100%" y2="50" stroke="#f0f3f5" strokeWidth="1"/>
               <line x1="0" y1="100" x2="100%" y2="100" stroke="#f0f3f5" strokeWidth="1"/>
               <line x1="0" y1="150" x2="100%" y2="150" stroke="#f0f3f5" strokeWidth="1"/>
               <line x1="0" y1="200" x2="100%" y2="200" stroke="#f0f3f5" strokeWidth="1"/>
               <line x1="0" y1="240" x2="100%" y2="240" stroke="#f0f3f5" strokeWidth="1"/>

               {/* Wave Background */}
               <defs>
                  <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                     <stop offset="0%" stopColor="rgba(124, 77, 255, 0.2)" />
                     <stop offset="100%" stopColor="rgba(124, 77, 255, 0)" />
                  </linearGradient>
               </defs>
               <path d="M0,180 Q150,130 300,150 T600,100 T800,40 C900,50 1000,70 1100,60 L1100,240 L0,240 Z" fill="url(#purpleGradient)" />
               {/* Wave Line */}
               <path d="M0,180 Q150,130 300,150 T600,100 T800,40 C900,50 1000,70 1100,60" fill="none" stroke="#7C4DFF" strokeWidth="3" />
               
               {/* Data Point */}
               <circle cx="800" cy="40" r="4" fill="#7C4DFF" />
            </svg>
            <div className="chart-x-axis">
               <span>OCT 01</span>
               <span>OCT 08</span>
               <span>OCT 15</span>
               <span>OCT 22</span>
               <span>OCT 30</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Pending Projects */}
      <div className="admin-card recent-projects-card">
         <div className="admin-card-header">
            Recent Pending Projects
            <Link to="/admin/projects/pending" className="view-all-link">View All</Link>
         </div>
         <div className="admin-card-body p-0">
            <table className="admin-table modern-table">
               <thead>
                  <tr>
                     <th>PROJECT TITLE</th>
                     <th>FOUNDER</th>
                     <th>GOAL AMOUNT</th>
                     <th>CATEGORY</th>
                     <th className="text-right">QUICK ACTION</th>
                  </tr>
               </thead>
               <tbody>
                  {loading ? (
                     <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                  ) : recentPending.length === 0 ? (
                     <tr><td colSpan="5" className="text-center py-4">No pending projects.</td></tr>
                  ) : (
                     recentPending.map(p => (
                        <tr key={p.id}>
                           <td className="font-semibold text-dark">{p.title}</td>
                           <td>
                              <div className="flex-align-center">
                                 <img src={`https://ui-avatars.com/api/?name=${p.owner?.name || 'User'}&background=random`} alt="Avatar" className="founder-avatar"/>
                                 <span>{p.owner?.name || 'Unknown User'}</span>
                              </div>
                           </td>
                           <td className="font-semibold">${parseInt(p.goal_amount).toLocaleString()}</td>
                           <td><span className="category-badge">{p.category?.name || 'Environment'}</span></td>
                           <td className="text-right actions-cell">
                              <button 
                                 className="btn-action bg-success text-white"
                                 onClick={() => handleAction(p.id, 'APPROVE')}
                              >Approve</button>
                              <button 
                                 className="btn-action bg-danger text-dark"
                                 onClick={() => handleAction(p.id, 'REJECT')}
                              >Reject</button>
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
