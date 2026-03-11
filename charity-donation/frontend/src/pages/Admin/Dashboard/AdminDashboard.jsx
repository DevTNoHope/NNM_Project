import { useState, useEffect } from "react";
import "./AdminDashboard.css";
const API_URL = "http://localhost:5000/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: { total: 0 },
    projects: { total: 0, pending: 0 },
    donations: { totalCount: 0, totalAmount: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/dashboard`);
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="dashboard-wrapper">
      <div className="widget-row">
        {/* Widget 1 - Users */}
        <div className="widget-pill grad-blue">
          <div className="widget-icon">👥</div>
          <div className="widget-content">
            <div className="widget-subtitle">Total Users</div>
            <div className="widget-title">{loading ? '...' : stats.users.total}</div>
          </div>
        </div>

        {/* Widget 2 - Total Projects */}
        <div className="widget-pill grad-pink">
          <div className="widget-icon">📋</div>
          <div className="widget-content">
            <div className="widget-subtitle">Total Projects</div>
            <div className="widget-title">{loading ? '...' : stats.projects.total}</div>
          </div>
        </div>

        {/* Widget 3 - Pending Projects */}
        <div className="widget-pill grad-purple">
          <div className="widget-icon">⏳</div>
          <div className="widget-content">
            <div className="widget-subtitle">Pending Projects</div>
            <div className="widget-title">{loading ? '...' : stats.projects.pending}</div>
          </div>
        </div>

        {/* Widget 4 - Donations */}
        <div className="widget-pill grad-navy">
          <div className="widget-icon">💰</div>
          <div className="widget-content">
             <div className="widget-subtitle">Total Donations</div>
            <div className="widget-title">{loading ? '...' : `${(stats.donations.totalAmount / 1_000_000_000).toFixed(2)}B`}</div>
          </div>
        </div>
      </div>

       {/* Traffic Chart Simulation */}
      <div className="admin-card mock-chart-card">
        <div className="admin-card-header">
          Traffic
          <div className="chart-actions">
            <button className="btn-core btn-sm" style={{backgroundColor: '#fff', color: '#23282c'}}>Day</button>
            <button className="btn-core btn-primary btn-sm">Month</button>
            <button className="btn-core btn-sm" style={{backgroundColor: '#fff', color: '#23282c'}}>Year</button>
          </div>
        </div>
        <div className="admin-card-body">
          <div className="chart-legend">November 2026</div>
          <div className="mock-chart-graphic">
             {/* A highly simplified SVG to emulate the CoreUI multi-line traffic chart */}
            <svg width="100%" height="300" preserveAspectRatio="none">
               {/* Grid */}
               <line x1="0" y1="50" x2="100%" y2="50" stroke="#f0f3f5" strokeWidth="1"/>
               <line x1="0" y1="100" x2="100%" y2="100" stroke="#f0f3f5" strokeWidth="1"/>
               <line x1="0" y1="150" x2="100%" y2="150" stroke="#f0f3f5" strokeWidth="1"/>
               <line x1="0" y1="200" x2="100%" y2="200" stroke="#f0f3f5" strokeWidth="1"/>
               <line x1="0" y1="250" x2="100%" y2="250" stroke="#f0f3f5" strokeWidth="1"/>
               <line x1="0" y1="280" x2="100%" y2="280" stroke="#f86c6b" strokeWidth="1" strokeDasharray="5,5"/>

               {/* Wave 1 Background */}
               <path d="M0,200 Q50,100 100,220 T200,150 T300,240 T400,100 T500,220 T600,80 T700,200 L700,300 L0,300 Z" fill="rgba(32, 168, 216, 0.1)" />
               {/* Wave 1 Line */}
               <path d="M0,200 Q50,100 100,220 T200,150 T300,240 T400,100 T500,220 T600,80 T700,200" fill="none" stroke="#20a8d8" strokeWidth="2" />
               
               {/* Wave 2 Line */}
               <path d="M0,250 C100,250 150,220 200,240 S300,260 350,240 S450,230 500,240 S600,250 700,230" fill="none" stroke="#4dbd74" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
