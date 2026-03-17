import { useState, useEffect } from "react";
// Tạm thời gọi trực tiếp endpoint ở localhost:5000 do chưa setup Axios base
const API_URL = "http://localhost:5000/api";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State cho tạo/chỉnh sửa Category
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null); // Tồn tại = EDIT, Null = CREATE
  const [catName, setCatName] = useState("");

  // Modal State cho danh sách Projects thuộc Category
  const [projectsModalOpen, setProjectsModalOpen] = useState(false);
  const [selectedCatForProjects, setSelectedCatForProjects] = useState(null);
  const [categoryProjects, setCategoryProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCat(null);
    setCatName("");
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchCategories();
      } else {
        alert("Delete failed: " + data.message);
      }
    } catch (error) {
       console.error(error);
       alert("Network error on delete.");
    }
  };

  const openProjectsModal = async (cat) => {
    setSelectedCatForProjects(cat);
    setProjectsModalOpen(true);
    setProjectsLoading(true);
    setCategoryProjects([]);
    try {
      const res = await fetch(`${API_URL}/categories/${cat.id}/projects`);
      const data = await res.json();
      if (data.success) {
        setCategoryProjects(data.data);
      }
    } catch (error) {
      console.error("Error fetching category projects:", error);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!catName.trim()) {
      alert("Category name cannot be empty!");
      return;
    }

    try {
      let res;
      if (editingCat) {
        // Cập nhật (PUT)
        res = await fetch(`${API_URL}/categories/${editingCat.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: catName })
        });
      } else {
        // Tạo mới (POST)
        res = await fetch(`${API_URL}/categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: catName })
        });
      }

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        fetchCategories();
      } else {
        alert("Error: " + data.message);
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
          Category Management
          <button className="btn-core btn-primary btn-sm" onClick={openCreateModal}>
            + Add New
          </button>
        </div>
        <div className="admin-card-body">
          {loading ? (
            <p>Loading data...</p>
          ) : categories.length === 0 ? (
            <p>No categories yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Category Name</th>
                    <th>Total Donated (VND)</th>
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td><strong>{c.name}</strong></td>
                      <td><strong style={{ color: '#4dbd74' }}>{parseInt(c.total_amount || 0).toLocaleString()}</strong></td>
                      <td>{new Date(c.created_at).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="btn-core btn-info btn-sm" 
                          style={{ marginRight: '5px', color: 'white' }}
                          onClick={() => openProjectsModal(c)}
                        >
                          View Projects
                        </button>
                        <button 
                          className="btn-core btn-warning btn-sm" 
                          style={{ marginRight: '5px' }}
                          onClick={() => openEditModal(c)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-core btn-danger btn-sm"
                          onClick={() => handleDelete(c.id)}
                        >
                          Delete
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

       {/* Component Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h5>{editingCat ? "Update Category" : "Add New Category"}</h5>
              <button className="close-btn" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <div className="admin-modal-body">
              <label>Category Name:</label>
              <input 
                type="text" 
                value={catName} 
                onChange={(e) => setCatName(e.target.value)} 
                placeholder="e.g., Flood Relief..." />
            </div>
            <div className="admin-modal-footer">
              <button className="btn-core" style={{ backgroundColor: '#c8ced3', color: '#23282c' }} onClick={() => setModalOpen(false)}>Cancel</button>
              <button 
                className="btn-core btn-primary"
                onClick={handleSubmit}
              >
                {editingCat ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Category Projects */}
      {projectsModalOpen && selectedCatForProjects && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '800px', width: '90%' }}>
            <div className="admin-modal-header">
              <h5>Projects in Category: {selectedCatForProjects.name}</h5>
              <button className="close-btn" onClick={() => setProjectsModalOpen(false)}>&times;</button>
            </div>
            <div className="admin-modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {projectsLoading ? (
                <p>Loading projects...</p>
              ) : categoryProjects.length === 0 ? (
                <p>No projects found in this category.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Project ID</th>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Goal (VND)</th>
                      <th>Raised (VND)</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryProjects.map(p => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td><strong>{p.title}</strong></td>
                        <td>
                          <span className={`badge ${p.status === 'APPROVED' ? 'btn-success' : p.status === 'REJECTED' ? 'btn-danger' : 'btn-warning'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>{parseInt(p.goal_amount).toLocaleString()}</td>
                        <td><strong style={{ color: '#20a8d8' }}>{parseInt(p.total_donated || 0).toLocaleString()}</strong></td>
                        <td>{new Date(p.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="admin-modal-footer">
              <button className="btn-core" style={{ backgroundColor: '#c8ced3', color: '#23282c' }} onClick={() => setProjectsModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
