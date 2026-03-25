import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  getProjectById,
  getProjectDonations,
  getProjectUpdates,
  createProjectUpdate
} from "../../../api/projectApi";
import Button from "../../../components/common/Button";
import Spinner from "../../../components/common/Spinner";
import CampaignProgressStat from "../../../components/project/FounderDashboard/CampaignProgressStat";
import RecentDonationsTable from "../../../components/project/FounderDashboard/RecentDonationsTable";
import PostUpdateForm from "../../../components/project/FounderDashboard/PostUpdateForm";
import TimelineHistory from "../../../components/project/FounderDashboard/TimelineHistory";
import WithdrawalModal from "../../../components/project/FounderDashboard/WithdrawalModal";
import withdrawApi from "../../../api/withdraw.api";
import "./FounderProjectDashboard.css";

export default function FounderProjectDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [donations, setDonations] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [withdrawals, setWithdrawals] = useState([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const [newUpdate, setNewUpdate] = useState({ title: "", content: "", imageFile: null, imagePreview: "" });
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [projRes, donRes, updRes, withdrawRes] = await Promise.all([
          getProjectById(id),
          getProjectDonations(id),
          getProjectUpdates(id),
          withdrawApi.getRequests()
        ]);

        if (mounted) {
          const p = projRes.data?.data;
          // Security check: Only founder can view this dashboard
          if (p.founder_id !== user?.id) {
            navigate("/my-projects");
            return;
          }
          setProject(p);
          const allDonations = donRes.data?.data || [];
          setDonations(allDonations.filter(d => d.status === "CONFIRMED"));
          setUpdates(updRes.data?.data || []);

          const allWithdrawals = withdrawRes.data?.data || [];
          setWithdrawals(allWithdrawals.filter(w => Number(w.project_id) === Number(id)));
        }
      } catch (err) {
        if (mounted) {
          setError(err.response?.data?.message || "Failed to load dashboard data.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => { mounted = false; };
  }, [id, user, navigate]);

  const handleCreateUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdate.title || !newUpdate.content) return;

    setSubmittingUpdate(true);
    try {
      const formData = new FormData();
      formData.append("authorId", user.id);
      formData.append("title", newUpdate.title);
      formData.append("content", newUpdate.content);
      if (newUpdate.imageFile) {
        formData.append("updateImage", newUpdate.imageFile);
      }

      await createProjectUpdate(id, formData);

      // Refresh updates
      const updRes = await getProjectUpdates(id);
      setUpdates(updRes.data?.data || []);
      setNewUpdate({ title: "", content: "", imageFile: null, imagePreview: "" });
      alert("Update posted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to post update.");
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const refreshWithdrawals = async () => {
    try {
      const res = await withdrawApi.getRequests();
      const allWithdrawals = res.data?.data || [];
      setWithdrawals(allWithdrawals.filter(w => Number(w.project_id) === Number(id)));
    } catch (err) {
      console.error("Failed to refresh withdrawals", err);
    }
  };

  if (loading) return <Spinner center size="lg" />;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!project) return null;

  const totalDonated = donations
    .reduce((sum, d) => sum + Number(d.amount), 0);

  const progressPercent = Math.min(100, (totalDonated / Number(project.goal_amount)) * 100);

  return (
    <div className="founder-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard: {project.title}</h1>
          <p className="dashboard-subtitle">Manage your campaign updates and view donation progress.</p>
        </div>
        <div className="dashboard-actions">
          <Button variant="outline" onClick={() => navigate("/my-projects")}>
            Back to Projects
          </Button>
          <Button variant="primary" onClick={() => navigate(`/projects/${project.id}`)}>
            View Public Page
          </Button>
        </div>
      </div>

      {project.cover_image_url && (
        <div className="dashboard-cover-image">
          <img src={project.cover_image_url} alt={project.title} />
        </div>
      )}

      <div className="dashboard-grid">
        {/* Overview Column */}
        <div className="dashboard-main">
          <CampaignProgressStat
            project={project}
            totalDonated={totalDonated}
            donationsCount={donations.length}
            onWithdraw={() => setShowWithdrawModal(true)}
          />
          <RecentDonationsTable
            donations={donations}
          />
        </div>

        {/* Updates Column */}
        <div className="dashboard-sidebar">
          <PostUpdateForm
            newUpdate={newUpdate}
            setNewUpdate={setNewUpdate}
            onSubmit={handleCreateUpdate}
            submittingUpdate={submittingUpdate}
          />
          <TimelineHistory
            updates={updates}
          />
        </div>
      </div>

      {withdrawals.length > 0 && (
        <div className="withdrawals-section card mt-8">
          <h2 className="section-title">Withdrawal History</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Note</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(w => (
                  <tr key={w.id}>
                    <td>{new Date(w.created_at).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${w.type.toLowerCase()}`}>{w.type}</span></td>
                    <td>${Number(w.amount).toLocaleString()}</td>
                    <td>
                      <span className={`status-tag status-${w.status.toLowerCase()}`}>
                        {w.status}
                      </span>
                    </td>
                    <td>{w.note || '-'}</td>
                    <td>
                      {w.claim_tx_hash && (
                        <a
                          href={`https://testnet.bscscan.com/tx/${w.claim_tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary btn-sm"
                          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          🔗 View Explorer
                        </a>
                      )}
                      {!w.claim_tx_hash && w.status === 'APPROVED' && w.type === 'CRYPTO' && (
                        <a
                          className="btn btn-outline-primary btn-sm"
                          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#10b981', borderColor: '#10b981' }}
                        >
                          🔐 Claim (Check Email)
                        </a>
                      )}
                      {w.status === 'PENDING_EMAIL' && (
                        <span className="text-sm text-gray-500 italic">Pending email verification</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showWithdrawModal && (
        <WithdrawalModal
          project={project}
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={refreshWithdrawals}
        />
      )}
    </div>
  );
}
