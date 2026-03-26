import React, { useState, useEffect, useRef } from "react";
import { Table, Input, Button as AntDButton, Space, Tag, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import ProjectDetailModal from "../../../components/ProjectDetailModal/ProjectDetailModal";
import http from "../../../api/http";
import "./PendingProjects.css";

const STATUS_MAP = {
  DRAFT: { label: "Draft", color: "default" },
  PENDING: { label: "Pending", color: "orange" },
  APPROVED: { label: "Approved", color: "blue" },
  PUBLISHED: { label: "Published", color: "green" },
  REJECTED: { label: "Rejected", color: "red" },
  ARCHIVED: { label: "Archived", color: "purple" },
};

const PendingProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Custom Table Filter State
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const filteredProjects = filterStatus === 'ALL' 
    ? projects 
    : projects.filter(p => p.status === filterStatus);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await http.get("/admin/projects");
      const data = res.data;
      if (data.success) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error("Error fetching project list:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openDetailModal = (project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  const handleAction = async (projectId, action, noteText) => {
    const endpoint = action === 'APPROVE' 
      ? `/admin/projects/${projectId}/approve`
      : `/admin/projects/${projectId}/reject`;

    try {
      const res = await http.post(endpoint, { note: noteText });
      const data = res.data;
      if (data.success) {
        setModalOpen(false);
        fetchProjects();
      } else {
        alert("Error occurred: " + data.message);
      }
    } catch (error) {
      alert("Server connection error.");
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
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      ...getColumnSearchProps("title"),
      render: (text) => <span style={{ fontWeight: 600, color: '#111827' }}>{text}</span>,
    },
    {
      title: "Goal ($)",
      dataIndex: "goal_amount",
      key: "goal_amount",
      sorter: (a, b) => Number(a.goal_amount || 0) - Number(b.goal_amount || 0),
      render: (val) => <span>${Number(val || 0).toLocaleString()}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const meta = STATUS_MAP[status] || { label: status, color: "default" };
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      render: (_, record) => (
        <AntDButton 
          type="primary" 
          shape="round" 
          size="small"
          onClick={() => openDetailModal(record)}
        >
          Details
        </AntDButton>
      ),
    },
  ];

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          All Projects List
          <span className="badge-soft-primary">TOTAL {projects.length}</span>
        </div>
        <div className="admin-card-body p-0">
          <div style={{ padding: '1.5rem 1.5rem 0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#4B5563' }}>Filter by Status:</span>
            <Select 
               value={filterStatus} 
               onChange={(val) => setFilterStatus(val)}
               style={{ width: 150 }}
               options={[
                 { value: "ALL", label: "All Statuses" },
                 { value: "PENDING", label: "Pending" },
                 { value: "APPROVED", label: "Approved" },
                 { value: "REJECTED", label: "Rejected" },
                 { value: "PUBLISHED", label: "Published" },
               ]}
            />
          </div>

          <div style={{ padding: '1.5rem' }}>
            <Table
              className="modern-antd-table"
              columns={columns}
              dataSource={filteredProjects}
              rowKey="id"
              loading={loading}
              pagination={{
                defaultPageSize: 5,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '20', '50'],
              }}
              scroll={{ x: 800 }}
            />
          </div>
        </div>
      </div>

      {modalOpen && selectedProject && (
        <ProjectDetailModal 
          project={selectedProject} 
          onClose={() => setModalOpen(false)}
          onApprove={(id, noteText) => handleAction(id, 'APPROVE', noteText)}
          onReject={(id, noteText) => handleAction(id, 'REJECT', noteText)}
          onVaultCreated={() => {
            setModalOpen(false);
            fetchProjects();
          }}
        />
      )}
    </div>
  );
};

export default PendingProjects;
