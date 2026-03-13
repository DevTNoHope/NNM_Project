import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyProjects, deleteMyProject, submitProjectForReview } from "../../api/projectApi";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import "./UserProjects.css";

const STATUS_MAP = {
  DRAFT: { label: "Bản nháp", class: "bg-gray-100 text-gray-700" },
  PENDING: { label: "Đang chờ duyệt", class: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "Đã duyệt", class: "bg-blue-100 text-blue-700" },
  PUBLISHED: { label: "Đang gây quỹ", class: "bg-green-100 text-green-700" },
  REJECTED: { label: "Bị từ chối", class: "bg-red-100 text-red-700" },
  PAUSED: { label: "Tạm dừng", class: "bg-gray-100 text-gray-600" },
  COMPLETED: { label: "Đã hoàn thành", class: "bg-purple-100 text-purple-700" },
};

function StatusBadge({ status }) {
  const meta = STATUS_MAP[status] || { label: status, class: "bg-gray-100 text-gray-700" };
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${meta.class}`}>
      {meta.label}
    </span>
  );
}

export default function UserProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyProjects();
      setProjects(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải danh sách dự án của bạn.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bản nháp này không?")) return;
    try {
      await deleteMyProject(id);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Xóa dự án thất bại.");
    }
  };

  const handleSubmit = async (id) => {
    if (!window.confirm("Gửi dự án này để admin phê duyệt? (Không thể sửa trong khi chờ duyệt)")) return;
    try {
      await submitProjectForReview(id);
      fetchProjects();
      alert("Đã gửi dự án thành công!");
    } catch (err) {
      alert(err.response?.data?.message || "Gửi dự án thất bại.");
    }
  };

  if (loading) return <Spinner center size="lg" />;

  return (
    <div className="user-projects-container">
      <div className="user-projects-header">
        <div>
          <h1 className="user-projects-title">Dự án của tôi</h1>
          <p className="user-projects-subtitle">
            Quản lý các chiến dịch gây quỹ bạn đang lên kế hoạch.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate("/my-projects/create")}>
          + Tạo dự án mới
        </Button>
      </div>

      {error && <div className="user-projects-error">{error}</div>}

      {projects.length === 0 ? (
        <EmptyState
          title="Chưa có dự án nào"
          description="Bạn chưa tạo chiến dịch gây quỹ nào. Hãy bắt đầu bằng cách tạo một dự án mới!"
          action="Tạo dự án mới"
          actionPath="/my-projects/create"
        />
      ) : (
        <div className="user-projects-table-wrapper">
          <table className="user-projects-table">
            <thead>
              <tr>
                <th>Tên dự án</th>
                <th>Mục tiêu</th>
                <th>Tình trạng</th>
                <th>Ngày tạo</th>
                <th className="text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const canEditOrDelete = project.status === "DRAFT" || project.status === "REJECTED";
                
                return (
                  <tr key={project.id}>
                    <td className="font-medium text-gray-900">{project.title}</td>
                    <td>{Number(project.goal_amount || 0).toLocaleString("vi-VN")}đ</td>
                    <td><StatusBadge status={project.status} /></td>
                    <td>
                      {project.created_at
                        ? new Date(project.created_at).toLocaleDateString("vi-VN")
                        : "-"}
                    </td>
                    <td className="text-right">
                      <div className="action-buttons">
                        {canEditOrDelete && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => navigate(`/my-projects/${project.id}/edit`)}
                            >
                              Sửa
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleSubmit(project.id)}
                            >
                              Nộp duyệt
                            </Button>
                            <button
                              className="delete-button"
                              onClick={() => handleDelete(project.id)}
                            >
                              Xóa
                            </button>
                          </>
                        )}
                        
                        {(project.status === "APPROVED" || project.status === "PUBLISHED") && (
                          <Link to={`/projects/${project.id}`} className="view-button">
                            Xem trang
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
