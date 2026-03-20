import { useState, useEffect } from "react";
import http from "../../../api/http";

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
      const res = await http.get("/admin/users");
      const data = res.data;
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
      const res = await http.get(`/admin/users/${user.id}/donations`);
      const data = res.data;
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
          <span className="badge-soft-primary">TOTAL {users.length}</span>
        </div>
        <div className="admin-card-body p-0">
          {loading ? (
            <p className="text-center py-4">Loading data...</p>
          ) : users.length === 0 ? (
            <p className="text-center py-4">No users found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Linked Wallet</th>
                    <th className="text-center">Total Projects Donated</th>
                    <th>Total Amount Donated ($)</th>
                    <th>Joined At</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td className="font-semibold text-dark">{u.email}</td>
                      <td>
                        <span className={`badge-soft-${u.role === 'ADMIN' ? 'danger' : u.role === 'FOUNDER' ? 'primary' : 'success'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u.linked_wallet ? (
                          <span style={{ fontFamily: 'monospace', color: '#6B7280' }}>
                            {u.linked_wallet.substring(0, 6)}...{u.linked_wallet.substring(u.linked_wallet.length - 4)}
                          </span>
                        ) : (
                          <span style={{ color: '#ccc', fontStyle: 'italic' }}>None</span>
                        )}
                      </td>
                      <td className="text-center">{u.total_projects_donated || 0}</td>
                      <td className="font-semibold text-success">
                         ${parseInt(u.total_amount_donated || 0).toLocaleString()}
                      </td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="text-right">
                        <button 
                          className="btn-action bg-primary"
                          style={{ borderRadius: '20px', padding: '6px 16px' }}
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
          <div className="admin-modal-modern">
            <div className="modal-header-modern">
               <div>
                  <h5>User Donation History - {selectedUser.email.split('@')[0]}</h5>
                  <p>Contributor Profile & History</p>
               </div>
               <button className="modal-close-icon" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            
            <div className="modal-body-modern" style={{ padding: '0' }}>
               {/* Summary Cards Row */}
               <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #F3F4F6' }}>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                     {/* Card 1 */}
                     <div style={{ flex: 1, padding: '1.25rem', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#F9FAFB' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px' }}>Total Donated</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7C4DFF' }}>
                           <span style={{fontSize: '1rem'}}>$</span> {history.reduce((sum, h) => sum + parseFloat(h.amount || 0), 0).toLocaleString()}
                        </div>
                     </div>
                     {/* Card 2 */}
                     <div style={{ flex: 1, padding: '1.25rem', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#F9FAFB' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px' }}>Joined On</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                           <svg fill="currentColor" width="20" height="20" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                           {new Date(selectedUser.created_at).toLocaleDateString()}
                        </div>
                     </div>
                  </div>
               </div>

               {/* Table Content */}
               <div style={{ padding: '1.5rem 2rem 0 2rem' }}>
                  <h6 style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.5px', color: '#111827', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                     <svg fill="currentColor" width="16" height="16" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                     RECENT DONATIONS
                  </h6>
               </div>

               {historyLoading ? (
                 <p className="text-center py-4">Loading user's donation history...</p>
               ) : history.length === 0 ? (
                 <p className="text-center py-4" style={{ color: '#6B7280' }}>No confirmed donations found for this user.</p>
               ) : (
                 <table className="modern-table">
                   <thead>
                     <tr>
                       <th>Project Name</th>
                       <th>Amount ($)</th>
                       <th>Date</th>
                       <th className="text-right">Method</th>
                     </tr>
                   </thead>
                   <tbody>
                     {history.map(h => (
                       <tr key={h.id}>
                         <td className="font-semibold text-dark">{h.project_title}</td>
                         <td className="font-semibold text-dark">${parseInt(h.amount).toLocaleString()}</td>
                         <td>{new Date(h.created_at).toLocaleDateString()}</td>
                         <td className="text-right">
                           {h.donation_type ? (
                              <span className={`badge-soft-${h.donation_type === 'CRYPTO' ? 'warning' : 'primary'}`} style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>
                                {h.donation_type}
                              </span>
                           ) : 'N/A'}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}
            </div>
            
            <div className="modal-footer-modern">
              <button className="btn-core" style={{ background: 'transparent', color: '#6B7280' }} onClick={() => setModalOpen(false)}>Close</button>
              <button className="btn-core btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                 Export Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
