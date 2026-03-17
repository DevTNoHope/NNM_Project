import { useState, useEffect } from "react";
// Local endpoint (tạm thời)
const API_URL = "http://localhost:5000/api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State cho User History
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/users`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openHistoryModal = async (user) => {
    setSelectedUser(user);
    setModalOpen(true);
    setHistoryLoading(true);
    setHistory([]);
    try {
      const res = await fetch(`${API_URL}/admin/users/${user.id}/donations`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (error) {
      console.error("Error fetching user history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          User Management
          <span className="badge new">TOTAL {users.length}</span>
        </div>
        <div className="admin-card-body">
          {loading ? (
            <p>Loading data...</p>
          ) : users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Linked Wallet</th>
                    <th>Total Projects Donated</th>
                    <th>Total Amount Donated (VND)</th>
                    <th>Joined At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td><strong>{u.email}</strong></td>
                      <td>
                        <span className={`badge ${u.role === 'ADMIN' ? 'btn-danger' : 'btn-primary'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u.linked_wallet ? (
                          <span style={{ fontFamily: 'monospace', color: '#666' }}>
                            {u.linked_wallet.substring(0, 6)}...{u.linked_wallet.substring(u.linked_wallet.length - 4)}
                          </span>
                        ) : (
                          <span style={{ color: '#ccc', fontStyle: 'italic' }}>None</span>
                        )}
                      </td>
                      <td>{u.total_projects_donated}</td>
                      <td><strong style={{ color: '#4dbd74' }}>{parseInt(u.total_amount_donated).toLocaleString()}</strong></td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="btn-core btn-primary btn-sm"
                          onClick={() => openHistoryModal(u)}
                        >
                          View History
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

      {modalOpen && selectedUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '700px', width: '90%' }}>
            <div className="admin-modal-header">
              <h5>Donation History of "{selectedUser.email}"</h5>
              <button className="close-btn" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <div className="admin-modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {historyLoading ? (
                <p>Loading user's donation history...</p>
              ) : history.length === 0 ? (
                <p>No confirmed donations found for this user.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Donate ID</th>
                      <th>Project Title</th>
                      <th>Amount (VND)</th>
                      <th>Donation Type</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(h => (
                      <tr key={h.id}>
                        <td>{h.id}</td>
                        <td><strong>{h.project_title}</strong></td>
                        <td><strong style={{ color: '#20a8d8' }}>{parseInt(h.amount).toLocaleString()}</strong></td>
                        <td>
                          {h.donation_type ? (
                             <span className="badge" style={{ backgroundColor: '#e4e7ea', color: '#5c6873' }}>
                               {h.donation_type}
                             </span>
                          ) : 'N/A'}
                        </td>
                        <td>{new Date(h.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="admin-modal-footer">
              <button className="btn-core" style={{ backgroundColor: '#c8ced3', color: '#23282c' }} onClick={() => setModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
