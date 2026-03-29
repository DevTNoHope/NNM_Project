import React, { useRef, useState } from "react";
import { Table, Input, Button as AntDButton, Space, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Button from "@/components/common/Button";
import "./UserProjectsTable.css";

const STATUS_MAP = {
  DRAFT: { label: "Draft", color: "default" },
  PENDING: { label: "Pending Review", color: "orange" },
  APPROVED: { label: "Approved", color: "blue" },
  PUBLISHED: { label: "Published", color: "green" },
  REJECTED: { label: "Rejected", color: "red" },
  ARCHIVED: { label: "Archived", color: "purple" },
};

export default function UserProjectsTable({ projects, onRowClick, onEdit, onSubmit, onDelete, onManage, onView }) {
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

  // Setup custom filtered search for Project Name
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search Title`}
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

  const getCategoryFromProject = (p) => p.category_name || p.category?.name || p.category || "General";

  const uniqueCategories = Array.from(new Set(projects.map(getCategoryFromProject))).filter(Boolean);
  const categoryFilters = uniqueCategories.map(c => ({ text: c, value: c }));

  const columns = [
    {
      title: "Image",
      dataIndex: "cover_image_url",
      key: "image",
      width: 100,
      render: (url, record) => (
        url ? (
          <div className="project-img-wrapper" style={{ width: 64, height: 48 }}>
            <img src={url} alt={record.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
          </div>
        ) : (
          <div className="project-img-wrapper" style={{ width: 64, height: 48, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
            <span className="project-img-placeholder" style={{ fontSize: 10, color: '#999' }}>No img</span>
          </div>
        )
      ),
    },
    {
      title: "Project",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      ...getColumnSearchProps("title"),
      render: (text) => <span className="project-title" style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: "Category",
      key: "category",
      filters: categoryFilters,
      onFilter: (value, record) => getCategoryFromProject(record) === value,
      render: (_, record) => <span>{getCategoryFromProject(record)}</span>,
    },
    {
      title: "Goal Amount",
      dataIndex: "goal_amount",
      key: "goal_amount",
      sorter: (a, b) => Number(a.goal_amount || 0) - Number(b.goal_amount || 0),
      render: (val) => <span>${Number(val || 0).toLocaleString()}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: Object.keys(STATUS_MAP).map(key => ({ text: STATUS_MAP[key].label, value: key })),
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const meta = STATUS_MAP[status] || { label: status, color: "default" };
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: "Date Created",
      dataIndex: "created_at",
      key: "created_at",
      sorter: (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0),
      render: (date) => <span>{date ? new Date(date).toLocaleDateString() : "-"}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const canEditOrDelete = record.status === "DRAFT" || record.status === "REJECTED";
        const canManage = record.status === "PUBLISHED" || record.status === "ARCHIVED";

        return (
          <div className="table-actions" style={{ display: "flex", gap: "8px" }} onClick={(e) => e.stopPropagation()}>
            {canEditOrDelete && (
              <>
                <Button size="sm" variant="outline" onClick={() => onEdit(record.id)}>Edit</Button>
                <Button size="sm" variant="outline" onClick={() => onSubmit(record.id)}>Submit</Button>
                <Button
                  size="sm"
                  onClick={() => onDelete(record.id)}
                  style={{ backgroundColor: "#ef4444", color: "white", border: "none" }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#dc2626"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#ef4444"}
                >
                  Delete
                </Button>
              </>
            )}
            {canManage && (
              <>
                <Button size="sm" variant="outline" onClick={() => onView(record.id)}>View Page</Button>
                <Button size="sm" variant="primary" onClick={() => onManage(record.id)}>Manage</Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="user-projects-table-wrapper" style={{ backgroundColor: 'var(--color-surface)', borderRadius: 8, padding: 16 }}>
      <Table
        columns={columns}
        dataSource={projects}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => onRowClick(record),
          style: { cursor: 'pointer' }
        })}
        pagination={{
          defaultPageSize: 5,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
        }}
        scroll={{ x: 1000 }}
      />
    </div>
  );
}
