import React, { useState, useEffect, useRef } from "react";
import { Table, Input, Button as AntDButton, Space, Modal, message, Tag } from "antd";
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import http from "../../../api/http";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom Table Filter State
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  // Modal State cho tạo/chỉnh sửa Category
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catName, setCatName] = useState("");

  // Modal State cho danh sách Projects thuộc Category
  const [projectsModalOpen, setProjectsModalOpen] = useState(false);
  const [selectedCatForProjects, setSelectedCatForProjects] = useState(null);
  const [categoryProjects, setCategoryProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await http.get("/categories");
      const data = res.data;
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Failed to fetch categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCat(null);
    setCatName("");
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this category?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const res = await http.delete(`/categories/${id}`);
          if (res.data.success) {
            message.success("Category deleted successfully.");
            fetchCategories();
          } else {
            message.error("Delete failed: " + res.data.message);
          }
        } catch (error) {
          console.error(error);
          message.error("Network error on delete.");
        }
      }
    });
  };

  const openProjectsModal = async (cat) => {
    setSelectedCatForProjects(cat);
    setProjectsModalOpen(true);
    setProjectsLoading(true);
    setCategoryProjects([]);
    try {
      const res = await http.get(`/categories/${cat.id}/projects`);
      if (res.data.success) {
        setCategoryProjects(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching category projects:", error);
      message.error("Failed to load projects.");
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!catName.trim()) {
      message.warning("Category name cannot be empty!");
      return;
    }

    try {
      let res;
      if (editingCat) {
        res = await http.put(`/categories/${editingCat.id}`, { name: catName });
      } else {
        res = await http.post(`/categories`, { name: catName });
      }

      if (res.data.success) {
        message.success(editingCat ? "Category updated." : "Category created.");
        setModalOpen(false);
        fetchCategories();
      } else {
        message.error("Error: " + res.data.message);
      }
    } catch (error) {
      message.error("Server connection error.");
      console.error(error);
    }
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
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
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps("name"),
      render: (text) => <span style={{ fontWeight: 600, color: '#111827' }}>{text}</span>,
    },
    {
      title: "Total Donated ($)",
      dataIndex: "total_amount",
      key: "total_amount",
      sorter: (a, b) => Number(a.total_amount || 0) - Number(b.total_amount || 0),
      render: (val) => <span style={{ color: '#10b981', fontWeight: 600 }}>${Number(val || 0).toLocaleString()}</span>,
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      sorter: (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0),
      render: (date) => <span>{date ? new Date(date).toLocaleDateString() : "-"}</span>,
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Space>
          <AntDButton 
            type="default" 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => openProjectsModal(record)}
          >
            Projects
          </AntDButton>
          <AntDButton 
            type="primary" 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => openEditModal(record)}
          >
            Edit
          </AntDButton>
          <AntDButton 
            danger 
            size="small" 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </AntDButton>
        </Space>
      ),
    },
  ];

  const projectColumns = [
    {
      title: "Project ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "APPROVED" || status === "PUBLISHED") color = "green";
        if (status === "PENDING") color = "orange";
        if (status === "REJECTED") color = "red";
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: "Goal ($)",
      dataIndex: "goal_amount",
      key: "goal",
      render: (val) => <span>${Number(val || 0).toLocaleString()}</span>,
    },
    {
      title: "Raised ($)",
      dataIndex: "total_donated",
      key: "raised",
      render: (val) => <span style={{ color: '#1677ff', fontWeight: 600 }}>${Number(val || 0).toLocaleString()}</span>,
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created",
      render: (date) => <span>{date ? new Date(date).toLocaleDateString() : "-"}</span>,
    }
  ];

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Category Management</span>
          <AntDButton type="primary" onClick={openCreateModal}>
            + Add New
          </AntDButton>
        </div>
        <div className="admin-card-body p-0">
          <div style={{ padding: '1.5rem' }}>
            <Table
              className="modern-antd-table"
              columns={columns}
              dataSource={categories}
              rowKey="id"
              loading={loading}
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '20', '50'],
              }}
              scroll={{ x: 800 }}
            />
          </div>
        </div>
      </div>

      <Modal
        title={editingCat ? "Update Category" : "Add New Category"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editingCat ? "Update" : "Create"}
        cancelText="Cancel"
      >
        <div style={{ marginBottom: 16 }}>
          <p>{editingCat ? "Change the category name" : "Create a new category for projects"}</p>
          <Input 
            value={catName} 
            onChange={(e) => setCatName(e.target.value)} 
            placeholder="e.g., Flood Relief..." 
          />
        </div>
      </Modal>

      <Modal
        title={`Projects in Category: ${selectedCatForProjects?.name}`}
        open={projectsModalOpen}
        onCancel={() => setProjectsModalOpen(false)}
        footer={[
          <AntDButton key="close" onClick={() => setProjectsModalOpen(false)}>
            Close
          </AntDButton>
        ]}
        width={800}
      >
        <p style={{ marginBottom: 16 }}>All projects assigned to this category.</p>
        <Table
          columns={projectColumns}
          dataSource={categoryProjects}
          rowKey="id"
          loading={projectsLoading}
          pagination={{ pageSize: 5 }}
          scroll={{ x: 700 }}
        />
      </Modal>
    </div>
  );
};

export default AdminCategories;
