import { useState, useEffect } from "react";
import http from "../../../api/http";

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
      const res = await http.get("/categories");
      const data = res.data;
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
      const res = await http.delete(`/categories/${id}`);
      const data = res.data;
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
      const res = await http.get(`/categories/${cat.id}/projects`);
      const data = res.data;
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
        res = await http.put(`/categories/${editingCat.id}`, { name: catName });
      } else {
        // Tạo mới (POST)
        res = await http.post(`/categories`, { name: catName });
      }

      const data = res.data;
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
        <div className="admin-card-body p-0">
          {loading ? (
            <p className="text-center py-4">Loading data...</p>
          ) : categories.length === 0 ? (
            <p className="text-center py-4">No categories yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Category Name</th>
                    <th>Total Donated ($)</th>
                    <th>Created At</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td className="font-semibold text-dark">{c.name}</td>
                      <td className="font-semibold text-success">
                        ${parseInt(c.total_amount || 0).toLocaleString()}
                      </td>
                      <td>{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="text-right">
                        <button 
                          className="btn-action bg-success"
                          onClick={() => openProjectsModal(c)}
                        >
                          View
                        </button>
                        <button 
                          className="btn-action bg-danger" 
                          onClick={() => openEditModal(c)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-action bg-danger"
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
          <div className="admin-modal-modern" style={{ width: '450px' }}>
            <div className="modal-header-modern">
               <div>
                  <h5>{editingCat ? "Update Category" : "Add New Category"}</h5>
                  <p>{editingCat ? "Change the category name" : "Create a new category for projects"}</p>
               </div>
               <button className="modal-close-icon" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body-modern">
              <label>Category Name</label>
              <input 
                type="text" 
                value={catName} 
                onChange={(e) => setCatName(e.target.value)} 
                placeholder="e.g., Flood Relief..." />
            </div>
            <div className="modal-footer-modern">
              <button className="btn-core btn-danger" onClick={() => setModalOpen(false)}>Cancel</button>
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
          <div className="admin-modal-modern">
            <div className="modal-header-modern">
               <div>
                  <h5>Projects in Category: {selectedCatForProjects.name}</h5>
                  <p>All projects assigned to this category.</p>
               </div>
               <button className="modal-close-icon" onClick={() => setProjectsModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body-modern" style={{ padding: '0' }}>
              {projectsLoading ? (
                <p className="text-center py-4">Loading projects...</p>
              ) : categoryProjects.length === 0 ? (
                <p className="text-center py-4">No projects found in this category.</p>
              ) : (
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Project ID</th>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Goal ($)</th>
                      <th>Raised ($)</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryProjects.map(p => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td className="font-semibold text-dark">{p.title}</td>
                        <td>
                           <span className={`badge-soft-${p.status === 'APPROVED' ? 'success' : p.status === 'REJECTED' ? 'danger' : 'warning'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>${parseInt(p.goal_amount).toLocaleString()}</td>
                        <td className="text-primary font-semibold">
                           ${parseInt(p.total_donated || 0).toLocaleString()}
                        </td>
                        <td>{new Date(p.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer-modern">
              <button className="btn-core btn-danger" onClick={() => setProjectsModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
