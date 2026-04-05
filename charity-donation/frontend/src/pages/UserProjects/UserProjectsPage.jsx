import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyProjects, deleteMyProject, submitProjectForReview } from "@/api/projectApi";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/common/Button";
import Spinner from "@/components/common/Spinner";
import EmptyState from "@/components/common/EmptyState";
import UserProjectsTable from "@/components/project/UserProjectsTable";
import ProjectDetailsModal from "@/components/project/ProjectDetailsModal";
import { alertSuccess, alertError, alertConfirm } from "@/utils/alert";
import "./UserProjects.css";



export default function UserProjectsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);

  const checkEligibility = () => {
    const issues = [];
    if (!user?.is_verified) issues.push("• Verify your email");
    if (!user?.linked_wallet) issues.push("• Link a wallet to your account");

    if (issues.length > 0) {
      alertError(
        "Cannot Create Project",
        `Please complete the following before creating a project:\n${issues.join("\n")}`
      );
      return false;
    }
    return true;
  };

  const handleCreateClick = () => {
    if (checkEligibility()) {
      navigate("/my-projects/create");
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyProjects();
      setProjects(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = await alertConfirm({
      title: 'Delete Draft',
      text: 'Are you sure you want to delete this draft?',
      confirmText: 'Yes, Delete',
      isDanger: true,
    });
    if (!confirmed) return;
    try {
      await deleteMyProject(id);
      fetchProjects();
    } catch (err) {
      alertError('Error', err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleSubmit = async (id) => {
    const confirmed = await alertConfirm({
      title: 'Submit Project',
      text: 'Submit this project for admin review? (You cannot edit it while pending)',
      confirmText: 'Submit',
    });
    if (!confirmed) return;
    try {
      await submitProjectForReview(id);
      fetchProjects();
      alertSuccess('Submitted!', 'Project submitted successfully!');
    } catch (err) {
      alertError('Error', err.response?.data?.message || 'Submit failed.');
    }
  };

  if (loading) return <Spinner center size="lg" />;

  return (
    <div className="user-projects-container">
      <div className="user-projects-header">
        <div>
          <h1 className="user-projects-title">My Projects</h1>
          <p className="user-projects-subtitle">
            Manage your fundraising campaigns.
          </p>
        </div>
        <Button variant="primary" onClick={handleCreateClick}>
          + Create Project
        </Button>
      </div>

      {error && <div className="user-projects-error">{error}</div>}

      {projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="You haven't created any campaigns yet. Let's get started!"
          action="Create a Project"
          onAction={handleCreateClick}
        />
      ) : (
        <UserProjectsTable 
          projects={projects}
          onRowClick={(p) => setSelectedProject(p)}
          onEdit={(id) => navigate(`/my-projects/${id}/edit`)}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          onManage={(id) => navigate(`/founder/projects/${id}`)}
          onView={(id) => navigate(`/projects/${id}`)}
        />
      )}

      {selectedProject && (
        <ProjectDetailsModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}
    </div>
  );
}
