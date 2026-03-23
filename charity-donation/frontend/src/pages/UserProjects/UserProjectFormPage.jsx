import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectById, createProjectDraft, updateMyProject } from "../../api/projectApi";
import { getCategories } from "../../api/categoryApi";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import UserProjectForm from "../../components/project/UserProjectForm";
import "./UserProjects.css";

export default function UserProjectFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    goal_amount: "",
    end_date: "",
    description: "",
    image_url: ""
  });

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        const [catRes, projRes] = await Promise.all([
          getCategories(),
          isEditing ? getProjectById(id) : Promise.resolve(null),
        ]);

        if (mounted && catRes?.data?.data) {
          setCategories(catRes.data.data);
        }

        if (mounted && isEditing && projRes?.data?.data) {
          const p = projRes.data.data;
          setFormData({
            title: p.title || "",
            category_id: p.category_id || p.categoryId || "",
            goal_amount: p.goal_amount || p.goalAmount || "",
            end_date: p.end_date ? p.end_date.split("T")[0] : "",
            description: p.description || "",
            image_url: p.cover_image_url || p.coverImageUrl || p.image_url || "",
          });
        }
      } catch (err) {
        if (mounted) {
           setError("Failed to load initial data. Please try again.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    loadData();

    return () => {
      mounted = false;
    };
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        return;
      }
      setCoverFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("categoryId", formData.category_id);
      data.append("goalAmount", Number(formData.goal_amount));
      data.append("description", formData.description);
      
      if (coverFile) {
        data.append("coverImage", coverFile);
      } else if (formData.image_url) {
        // Keep existing URL if no new file
        data.append("coverImageUrl", formData.image_url);
      }

      if (isEditing) {
        await updateMyProject(id, data);
        alert("Project updated successfully!");
      } else {
        await createProjectDraft(data);
        alert("Draft created successfully!");
      }

      navigate("/my-projects");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save the project. Please try again.");
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
            {isEditing ? "Edit Project" : "Create New Project"}
          </h1>
          <p className="user-projects-subtitle">
            Fill in the details to {isEditing ? "update" : "create"} your campaign.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/my-projects")}>
          Back
        </Button>
      </div>

      {error && <div className="user-projects-error">{error}</div>}

      <UserProjectForm 
        formData={formData}
        categories={categories}
        isEditing={isEditing}
        saving={saving}
        onChange={handleChange}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/my-projects")}
        imagePreview={imagePreview}
      />
    </div>
  );
}
