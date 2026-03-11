import { useState, useEffect } from "react";
import "./PendingProjects.css";
// Tạm thời gọi trực tiếp endpoint ở localhost:5000 do chưa setup Axios base
const API_URL = "http://localhost:5000/api"; 

const PendingProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [actionType, setActionType] = useState(""); // 'APPROVE' or 'REJECT'
  const [note, setNote] = useState("");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/projects`);
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error("Error fetching project list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openActionModal = (project, action) => {
    setSelectedProject(project);
    setActionType(action);
    setNote("");
    setModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedProject) return;
    
    // Tách endpoint theo thiết kế mới
    const endpoint = actionType === 'APPROVE' 
      ? `${API_URL}/admin/projects/${selectedProject.id}/approve`
      : `${API_URL}/admin/projects/${selectedProject.id}/reject`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note })
      });
      
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        // Tải lại danh sách sau khi thao tác
        fetchProjects();
      } else {
        alert("Error occurred: " + data.message);
      }
    } catch (error) {
      alert("Server connection error.");
      console.error(error);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'APPROVED': return <span className="badge btn-success" style={{padding: '5px 8px'}}>APPROVED</span>;
      case 'REJECTED': return <span className="badge btn-danger" style={{padding: '5px 8px'}}>REJECTED</span>;
      case 'PENDING': return <span className="badge btn-warning" style={{padding: '5px 8px'}}>PENDING</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          All Projects List
          <span className="badge new">TOTAL {projects.length}</span>
        </div>
        <div className="admin-card-body">
          {loading ? (
            <p>Loading data...</p>
          ) : projects.length === 0 ? (
            <p>No projects found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cover Image</th>
                    <th>Category</th>
                    <th>Title</th>
                    <th>Goal (VND)</th>
                    <th>Progress</th>
                    <th>Created At</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>
                        {p.cover_image_url ? (
                          <img src={p.cover_image_url} alt={p.title} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e0e6ed' }} />
                        ) : (
                          <div style={{ width: '60px', height: '40px', background: '#f4f7fa', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#8394b3', border: '1px dashed #c0ccda' }}>No Img</div>
                        )}
                      </td>
                      <td>
                        <span className="badge" style={{ backgroundColor: '#fcfdfe', color: '#394b6d', border: '1px solid #e0e6ed' }}>
                          {p.category_name || 'Other'}
                        </span>
                      </td>
                      <td><strong>{p.title}</strong></td>
                      <td>{parseInt(p.goal_amount).toLocaleString()}</td>
                      <td>
                        {(() => {
                          const goal = parseInt(p.goal_amount) || 0;
                          const donated = parseFloat(p.total_donated) || 0;
                          const percent = goal > 0 ? Math.min(Math.round((donated / goal) * 100), 100) : 0;
                          const remaining = Math.max(goal - donated, 0);
                          
                          return (
                            <div 
                              title={`Total Donated: ${donated.toLocaleString()} VND\nRemaining: ${remaining.toLocaleString()} VND`}
                              style={{ width: '100px', cursor: 'pointer' }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px', color: '#5c6873' }}>
                                <span>{percent}%</span>
                              </div>
                              <div style={{ height: '8px', background: '#e4e7ea', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${percent}%`, height: '100%', background: percent >= 100 ? '#4dbd74' : '#20a8d8', transition: 'width 0.3s ease' }}></div>
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td>{new Date(p.created_at).toLocaleDateString()}</td>
                      <td>{getStatusBadge(p.status)}</td>
                      <td>
                        {p.status === 'PENDING' ? (
                          <>
                            <button 
                              className="btn-core btn-success btn-sm" 
                              style={{ marginRight: '5px' }}
                              onClick={() => openActionModal(p, 'APPROVE')}
                            >
                              Approve
                            </button>
                            <button 
                              className="btn-core btn-danger btn-sm"
                              onClick={() => openActionModal(p, 'REJECT')}
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                           <span style={{color: '#999', fontStyle: 'italic'}}>N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalOpen && selectedProject && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h5>{actionType === 'APPROVE' ? "Confirm approval" : "Rejection reason"} "{selectedProject.title}"</h5>
              <button className="close-btn" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <div className="admin-modal-body">
              <label>Note (Optional for approval, Required for rejection):</label>
              <textarea 
                rows="4" 
                value={note} 
                onChange={(e) => setNote(e.target.value)} 
                placeholder="Enter note or reason here..."
              ></textarea>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-core" style={{ backgroundColor: '#c8ced3', color: '#23282c' }} onClick={() => setModalOpen(false)}>Cancel</button>
              <button 
                className={`btn-core ${actionType === 'APPROVE' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleConfirmAction}
              >
                {actionType === 'APPROVE' ? "Approve Project" : "Reject Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingProjects;
