import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFounderProjects } from "../../../api/projectApi";

function StatusBadge({ status }) {
  const map = {
    APPROVED: "bg-blue-100 text-blue-700",
    PUBLISHED: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    REJECTED: "bg-red-100 text-red-700",
    DRAFT: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        map[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

export default function FounderProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getFounderProjects();
        if (mounted) {
          setProjects(res.data?.data || []);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.response?.data?.message || "Không thể tải danh sách project"
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProjects();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p>Đang tải danh sách project...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý project của Founder</h1>
        <p className="mt-2 text-sm text-gray-600">
          Founder chỉ quản lý các project đã được duyệt/publish. Việc cập nhật
          nội dung của project published sẽ thực hiện qua bảng project_updates,
          không sửa/xóa trực tiếp project.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-600">
            Bạn chưa có project nào ở trạng thái APPROVED/PUBLISHED.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-left text-sm text-gray-600">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Tên project</th>
                <th className="px-4 py-3">Danh mục</th>
                <th className="px-4 py-3">Mục tiêu</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ngày tạo</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {projects.map((project) => (
                <tr key={project.id}>
                  <td className="px-4 py-3">#{project.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {project.title}
                  </td>
                  <td className="px-4 py-3">{project.category_name || "-"}</td>
                  <td className="px-4 py-3">
                    {Number(project.goal_amount || 0).toLocaleString("vi-VN")}đ
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-4 py-3">
                    {project.created_at
                      ? new Date(project.created_at).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/projects/${project.id}`}
                        className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        Xem chi tiết
                      </Link>

                      <Link
                        to={`/founder/projects/${project.id}/updates`}
                        className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90"
                      >
                        Cập nhật qua project_updates
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}