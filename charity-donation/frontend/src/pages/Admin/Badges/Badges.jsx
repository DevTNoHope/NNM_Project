import { useEffect, useState, useRef } from "react";
import { HexColorPicker } from "react-colorful";
import { Table, Input, Button as AntDButton, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Button from "@/components/common/Button";
import { alertConfirm } from "@/utils/alert";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const Badges = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    min_points: "",
    color: "#7C4DFF"
  });

  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [nameError, setNameError] = useState("");

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex, title) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${title}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <AntDButton
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </AntDButton>
          <AntDButton
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </AntDButton>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ?.toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps("name", "Name"),
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ...getColumnSearchProps("description", "Description"),
    },
    {
      title: "Points",
      dataIndex: "min_points",
      key: "min_points",
      sorter: (a, b) => Number(a.min_points || 0) - Number(b.min_points || 0),
    },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      render: (color) => (
        <span
          style={{
            background: color,
            color: "#fff",
            padding: "4px 10px",
            borderRadius: "6px"
          }}
        >
          {color}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Button size="sm" variant="primary" onClick={() => handleEdit(record)}>Edit</Button>
          <Button
            size="sm"
            onClick={() => handleDelete(record.id)}
            style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
          >Delete</Button>
        </div>
      ),
    },
  ];

  // 🔥 normalize (chỉ để fix khoảng trắng + lower)
  const normalize = (str) =>
    str.trim().toLowerCase().replace(/\s+/g, " ");

  // ================= FETCH =================
  const fetchBadges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      const res = await fetch(`${API}/admin/badges`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      setBadges(data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    setError("");

    if (nameError) return;

    if (!form.name || !form.min_points) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      const normalizedName = normalize(form.name);

      const url = editing
        ? `${API}/admin/badges/${editing.id}`
        : `${API}/admin/badges`;

      const method = editing ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          name: normalizedName,
          min_points: Number(form.min_points),
          slug: normalizedName.replace(/\s+/g, "-")
        })
      });

      closeModal();
      fetchBadges();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    const confirmed = await alertConfirm({
      title: 'Delete Badge',
      text: 'Bạn có chắc muốn xóa badge này?',
      confirmText: 'Yes, Delete',
      isDanger: true,
    });
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("accessToken");

      await fetch(`${API}/admin/badges/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      fetchBadges();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ================= EDIT =================
  const handleEdit = (badge) => {
    setEditing(badge);
    setForm({
      name: badge.name,
      description: badge.description || "",
      min_points: badge.min_points,
      color: badge.color || "#7C4DFF"
    });
    setNameError("");
    setShowModal(true);
  };

  // ================= MODAL =================
  const openModal = () => {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      min_points: "",
      color: "#7C4DFF"
    });
    setError("");
    setNameError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setError("");
    setNameError("");
  };

  return (
    <div className="admin-card">
      {/* HEADER */}
      <div className="admin-card-header">
        <span>🏅 Badge Management</span>
        <Button variant="primary" size="sm" onClick={openModal}>
          + Add Badge
        </Button>
      </div>

      {/* BODY */}
      <div className="admin-card-body">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={{ background: 'white', borderRadius: 8, padding: 16 }}>
            <Table
              columns={columns}
              dataSource={badges}
              rowKey="id"
              pagination={{
                defaultPageSize: 5,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '20', '50'],
              }}
              scroll={{ x: 800 }}
            />
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-modern">

            <div className="modal-header-modern">
              <div>
                <h5>{editing ? "Edit Badge" : "Create Badge"}</h5>
                <p>Manage badge information</p>
              </div>

              <button className="modal-close-icon" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="modal-body-modern">

              {error && (
                <p style={{ color: "red", marginBottom: "10px" }}>
                  {error}
                </p>
              )}

              <label>Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm({ ...form, name: value });

                  // 🔥 giữ logic cũ: >=2 ký tự mới check
                  if (value.trim().length < 2) {
                    setNameError("");
                    return;
                  }

                  const isDuplicate = badges.some(
                    (b) =>
                      normalize(b.name).includes(normalize(value)) &&
                      (!editing || b.id !== editing.id)
                  );

                  if (isDuplicate) {
                    setNameError("Tên badge đã tồn tại ❌");
                  } else {
                    setNameError("");
                  }
                }}
              />

              {nameError && (
                <p style={{ color: "red", fontSize: "13px", marginTop: "5px" }}>
                  {nameError}
                </p>
              )}

              <label>Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <label>Min Points</label>
              <input
                type="number"
                value={form.min_points}
                onChange={(e) =>
                  setForm({ ...form, min_points: e.target.value })
                }
                style={{
                  padding: "10px",
                  fontSize: "1.2rem",
                  border: "2px solid #d9d2e0ff",
                  borderRadius: "5px",
                  width: "100%",
                }}
              />

              <label>Color</label>

              <HexColorPicker
                color={form.color}
                onChange={(color) => setForm({ ...form, color })}
              />

              <div
                style={{
                  marginTop: "10px",
                  padding: "8px",
                  borderRadius: "6px",
                  background: form.color,
                  color: "#fff",
                  textAlign: "center",
                  fontWeight: "500"
                }}
              >
                {form.color}
              </div>

            </div>

            <div className="modal-footer-modern">
              <Button variant="outline" size="sm" onClick={closeModal}>
                Cancel
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                disabled={!!nameError}
              >
                {editing ? "Update" : "Create"}
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Badges;