import React, { useEffect, useState } from 'react';
import withdrawApi from '../../../api/withdraw.api';
import Button from '../../../components/common/Button';
import Spinner from '../../../components/common/Spinner';
import './WithdrawalManagement.css';

const WithdrawalManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await withdrawApi.getRequests(); // Admin gets all
      const all = res.data?.data || [];
      // Only show PENDING requests for management
      setRequests(all.filter(r => r.status === 'PENDING'));
    } catch (err) {
      setError('Failed to fetch withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (request) => {
    if (!window.confirm("Approve this withdrawal request?")) return;

    setActionLoading(request.id);
    try {
      await withdrawApi.approveRequest({ withdrawRequestId: request.id });
      alert("Withdrawal approved successfully!");
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Error during approval");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (request) => {
    if (!window.confirm("Reject this request?")) return;

    setActionLoading(request.id);
    try {
      await withdrawApi.rejectRequest({ withdrawRequestId: request.id });
      alert("Request rejected!");
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Error during rejection");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <Spinner center size="lg" />;

  return (
    <div className="admin-withdrawal-mgmt">
      <div className="admin-card">
        <div className="admin-card-header">
          Withdrawal Requests Management
          <span className="badge-soft-primary">PENDING {requests.length}</span>
        </div>
        <div className="admin-card-body p-0">
          {error && <div className="error-alert m-4">{error}</div>}

          {requests.length === 0 ? (
            <div className="empty-state">No pending withdrawal requests found.</div>
          ) : (
            <div style={{ overflowX: 'auto', padding: '1.5rem' }}>
              <table className="modern-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Project</th>
                    <th>Founder</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Bank Details</th>
                    <th>Note</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{new Date(r.created_at).toLocaleDateString()}</td>
                      <td className="font-semibold text-dark">{r.project_title || `ID: ${r.project_id}`}</td>
                      <td>
                        <div className="founder-info">
                          <p className="m-0 font-medium">{r.founder_name || 'N/A'}</p>
                          <p className="m-0 text-xs text-gray-500">{r.founder_email}</p>
                        </div>
                      </td>
                      <td>
                        <span className={`badge-soft-${r.type === 'CRYPTO' ? 'info' : 'warning'}`}>
                          {r.type}
                        </span>
                      </td>
                      <td className="font-bold text-dark">${Number(r.amount).toLocaleString()}</td>
                      <td>
                        {r.type === 'BANKING' ? (
                          <div className="bank-details-cell text-xs">
                            <p className="m-0"><strong>Bank:</strong> {r.bank_name}</p>
                            <p className="m-0"><strong>Acc:</strong> {r.account_number}</p>
                            <p className="m-0"><strong>Name:</strong> {r.account_name}</p>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="text-xs italic">{r.note || '-'}</td>
                      <td className="text-right">
                        <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                          <button 
                            className="btn-action bg-success"
                            style={{ borderRadius: '20px', padding: '6px 12px', marginRight: '8px' }}
                            onClick={() => handleApprove(r)}
                            disabled={actionLoading === r.id}
                          >
                            Approve
                          </button>
                          <button 
                            className="btn-action bg-danger"
                            style={{ borderRadius: '20px', padding: '6px 12px' }}
                            onClick={() => handleReject(r)}
                            disabled={actionLoading === r.id}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawalManagement;
