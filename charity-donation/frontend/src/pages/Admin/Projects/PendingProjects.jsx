import { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "datatables.net";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "./PendingProjects.css";
import ProjectDetailModal from "../../../components/ProjectDetailModal/ProjectDetailModal";
// Tạm thời gọi trực tiếp endpoint ở localhost:5000 do chưa setup Axios base
const API_URL = "http://localhost:5000/api"; 

const PendingProjects = () => {
  const tableRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

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
useEffect(() => {

  let table;

  if (!loading && projects.length > 0) {

    if ($.fn.dataTable.isDataTable(tableRef.current)) {
      $(tableRef.current).DataTable().destroy();
    }

    table = $(tableRef.current).DataTable({
      pageLength: 10,
      lengthMenu: [5, 10, 20, 50],
      ordering: true,
      searching: true,
      responsive: true
    });

  }

  return () => {
    if (table) {
      table.destroy();
    }
  };

}, [projects, loading]);

  const openDetailModal = (project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  const handleAction = async (projectId, action, noteText) => {
    const endpoint = action === 'APPROVE' 
      ? `${API_URL}/admin/projects/${projectId}/approve`
      : `${API_URL}/admin/projects/${projectId}/reject`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteText })
      });
      
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
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
              <table ref={tableRef} className="admin-table display">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Goal (VND)</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td><strong>{p.title}</strong></td>
                      <td>{parseInt(p.goal_amount).toLocaleString()}</td>
                      <td>{getStatusBadge(p.status)}</td>
                      <td>
                        <button 
                          className="btn-core btn-primary btn-sm"
                          onClick={() => openDetailModal(p)}
                        >
                          Details
                        </button>
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
        <ProjectDetailModal 
          project={selectedProject} 
          onClose={() => setModalOpen(false)}
          onApprove={(id, noteText) => handleAction(id, 'APPROVE', noteText)}
          onReject={(id, noteText) => handleAction(id, 'REJECT', noteText)}
        />
      )}
    </div>
  );
};

export default PendingProjects;
