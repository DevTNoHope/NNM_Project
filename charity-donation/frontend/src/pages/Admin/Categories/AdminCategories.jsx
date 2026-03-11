import { useState, useEffect } from "react";
// Tạm thời gọi trực tiếp endpoint ở localhost:5000 do chưa setup Axios base
const API_URL = "http://localhost:5000/api";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null); // Tồn tại = EDIT, Null = CREATE
  const [catName, setCatName] = useState("");

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
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(c => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td><strong>{c.name}</strong></td>
                      <td>{new Date(c.created_at).toLocaleDateString()}</td>
                      <td>
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
    </div>
  );
};

export default AdminCategories;
