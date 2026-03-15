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

  const [newUpdate, setNewUpdate] = useState({ title: "", content: "", imageUrl: "" });
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [projRes, donRes, updRes] = await Promise.all([
          getProjectById(id),
          getProjectDonations(id),
          getProjectUpdates(id)
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
      await createProjectUpdate(id, {
        authorId: user.id,
        ...newUpdate
      });
      
      // Refresh updates
      const updRes = await getProjectUpdates(id);
      setUpdates(updRes.data?.data || []);
      setNewUpdate({ title: "", content: "", imageUrl: "" });
      alert("Update posted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to post update.");
    } finally {
      setSubmittingUpdate(false);
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
    </div>
  );
}
