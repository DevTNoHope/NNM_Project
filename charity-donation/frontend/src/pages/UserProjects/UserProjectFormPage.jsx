import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, createProjectDraft, updateMyProject } from "../../api/projectApi";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import "./UserProjects.css";

export default function UserProjectFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    goal_amount: "",
    end_date: "",
    description: "",
    image_url: ""
  });

  useEffect(() => {
    if (isEditing) {
      const fetchProject = async () => {
        try {
          const res = await getProjectById(id);
          const p = res.data?.data;
          if (p) {
            setFormData({
              title: p.title || "",
              category_id: p.category_id || "",
              goal_amount: p.goal_amount || "",
              end_date: p.end_date ? p.end_date.split("T")[0] : "",
              description: p.description || "",
              image_url: p.cover_image_url || p.image_url || ""
            });
          }
        } catch (err) {
          setError(err.response?.data?.message || "Không thể tải thông tin dự án.");
        } finally {
          setLoading(false);
        }
      };
      
      fetchProject();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        title: formData.title,
        categoryId: formData.category_id,
        goalAmount: Number(formData.goal_amount),
        description: formData.description,
        coverImageUrl: formData.image_url,
      };

      if (isEditing) {
        await updateMyProject(id, payload);
        alert("Cập nhật dự án thành công!");
      } else {
        await createProjectDraft(payload);
        alert("Tạo bản nháp dự án thành công!");
      }

      navigate("/my-projects");
    } catch (err) {
      setError(err.response?.data?.message || "Lưu dự án thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner center size="lg" />;

  return (
    <div className="user-projects-container">
      <div className="user-projects-header">
        <div>
          <h1 className="user-projects-title">
            {isEditing ? "Chỉnh sửa dự án" : "Tạo dự án mới"}
          </h1>
          <p className="user-projects-subtitle">
            Điền thông tin chi tiết để {isEditing ? "cập nhật" : "tạo"} chiến dịch của bạn.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/my-projects")}>
          Quay lại
        </Button>
      </div>

      {error && <div className="user-projects-error">{error}</div>}

      <form className="user-projects-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Tên chiến dịch *</label>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="Ví dụ: Giúp đỡ trẻ em vùng cao..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category_id">Danh mục *</label>
            <select
              id="category_id"
              name="category_id"
              required
              value={formData.category_id}
              onChange={handleChange}
            >
              <option value="">-- Chọn danh mục --</option>
              <option value="1">Y tế & Sức khỏe</option>
              <option value="2">Giáo dục</option>
              <option value="3">Thiên tai & Khẩn cấp</option>
              {/* Thêm các option danh mục lấy từ API nếu cần */}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="goal_amount">Mục tiêu (VNĐ) *</label>
            <input
              id="goal_amount"
              name="goal_amount"
              type="number"
              min="10000"
              required
              value={formData.goal_amount}
              onChange={handleChange}
              placeholder="1000000"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="end_date">Ngày kết thúc *</label>
            <input
              id="end_date"
              name="end_date"
              type="date"
              required
              value={formData.end_date}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="image_url">Link ảnh bìa (URL)</label>
            <input
              id="image_url"
              name="image_url"
              type="url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Mô tả chi tiết *</label>
          <textarea
            id="description"
            name="description"
            rows="6"
            required
            value={formData.description}
            onChange={handleChange}
            placeholder="Kể câu chuyện về chiến dịch của bạn..."
          />
        </div>

        <div className="form-actions">
          <Button type="button" variant="outline" onClick={() => navigate("/my-projects")}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu bản nháp"}
          </Button>
        </div>
      </form>
    </div>
  );
}
