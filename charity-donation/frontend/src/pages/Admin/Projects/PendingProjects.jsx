import { useState, useEffect, useRef } from "react";
import $ from "jquery";
import "datatables.net";
import "datatables.net-dt/css/dataTables.dataTables.css";
import ProjectDetailModal from "../../../components/ProjectDetailModal/ProjectDetailModal";
import http from "../../../api/http";

const PendingProjects = () => {
  const tableRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const filteredProjects = filterStatus === 'ALL' 
    ? projects 
    : projects.filter(p => p.status === filterStatus);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await http.get("/admin/projects");
      const data = res.data;
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
    if (!loading && filteredProjects.length > 0) {
      if ($.fn.dataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }
      table = $(tableRef.current).DataTable({
        pageLength: 5, // Như trong hình mẫu
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
  }, [filteredProjects, loading]);

  const openDetailModal = (project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  const handleAction = async (projectId, action, noteText) => {
    const endpoint = action === 'APPROVE' 
      ? `/admin/projects/${projectId}/approve`
      : `/admin/projects/${projectId}/reject`;

    try {
      const res = await http.post(endpoint, { note: noteText });
      const data = res.data;
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

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          All Projects List
          <span className="badge-soft-primary">TOTAL {projects.length}</span>
        </div>
        <div className="admin-card-body p-0">
          <div style={{ padding: '1.5rem 1.5rem 0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#4B5563' }}>Filter by Status:</span>
            <select 
               value={filterStatus} 
               onChange={(e) => setFilterStatus(e.target.value)}
               style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>

          {loading ? (
            <p className="text-center py-4">Loading data...</p>
          ) : filteredProjects.length === 0 ? (
            <p className="text-center py-4">No projects found.</p>
          ) : (
            <div style={{ overflowX: 'auto', padding: '1.5rem' }}>
              <table ref={tableRef} className="modern-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Goal ($)</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map(p => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td className="font-semibold text-dark">{p.title}</td>
                      <td className="font-semibold">${parseInt(p.goal_amount).toLocaleString()}</td>
                      <td>
                         <span className={`badge-soft-${p.status === 'APPROVED' ? 'success' : p.status === 'REJECTED' ? 'danger' : p.status === 'PENDING' ? 'warning' : 'secondary'}`}>
                           {p.status}
                         </span>
                      </td>
                      <td className="text-right">
                        <button 
                          className="btn-action bg-primary"
                          style={{ borderRadius: '20px', padding: '6px 16px' }}
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
