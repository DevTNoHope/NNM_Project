import React, { useState, useEffect, useRef } from "react";
import { Table, Input, Button as AntDButton, Space, Modal, Tag, Card, Row, Col, Statistic, message } from "antd";
import { SearchOutlined, HistoryOutlined, DownloadOutlined, UserOutlined, ClockCircleOutlined, DollarOutlined } from "@ant-design/icons";
import http from "../../../api/http";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom Table Filter State
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  // Modal State cho User History
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await http.get("/admin/users");
      const data = res.data;
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openHistoryModal = async (user) => {
    setSelectedUser(user);
    setModalOpen(true);
    setHistoryLoading(true);
    setHistory([]);
    try {
      const res = await http.get(`/admin/users/${user.id}/donations`);
      const data = res.data;
      if (data.success) {
        setHistory(data.data);
      }
    } catch (error) {
      console.error("Error fetching user history:", error);
      message.error("Failed to fetch user history.");
    } finally {
      setHistoryLoading(false);
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
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
      ...getColumnSearchProps("email"),
      render: (text) => <span style={{ fontWeight: 600, color: '#111827' }}>{text}</span>,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        let color = "default";
        if (role === "ADMIN") color = "red";
        if (role === "FOUNDER") color = "blue";
        if (role === "USER") color = "green";
        return <Tag color={color}>{role}</Tag>;
      }
    },
    {
      title: "Linked Wallet",
      dataIndex: "linked_wallet",
      key: "linked_wallet",
      render: (wallet) => (
        wallet ? (
          <Tag style={{ fontFamily: 'monospace' }}>
            {wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}
          </Tag>
        ) : (
          <span style={{ color: '#ccc', fontStyle: 'italic' }}>None</span>
        )
      )
    },
    {
      title: "Projects Donated",
      dataIndex: "total_projects_donated",
      key: "projects",
      align: "center",
      sorter: (a, b) => (a.total_projects_donated || 0) - (b.total_projects_donated || 0),
    },
    {
      title: "Total Amount Donated ($)",
      dataIndex: "total_amount_donated",
      key: "amount",
      sorter: (a, b) => (a.total_amount_donated || 0) - (b.total_amount_donated || 0),
      render: (val) => <span style={{ color: '#10b981', fontWeight: 600 }}>${Number(val || 0).toLocaleString()}</span>,
    },
    {
      title: "Joined At",
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
        <AntDButton 
          type="primary" 
          size="small"
          icon={<HistoryOutlined />}
          onClick={() => openHistoryModal(record)}
        >
          History
        </AntDButton>
      ),
    },
  ];

  const historyColumns = [
    {
      title: "Project Name",
      dataIndex: "project_title",
      key: "project",
      render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
    },
    {
      title: "Amount ($)",
      dataIndex: "amount",
      key: "amount",
      render: (val) => <span style={{ color: '#1677ff', fontWeight: 600 }}>${Number(val || 0).toLocaleString()}</span>,
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "date",
      render: (date) => <span>{date ? new Date(date).toLocaleDateString() : "-"}</span>,
    },
    {
      title: "Method",
      dataIndex: "donation_type",
      key: "method",
      align: "right",
      render: (type) => {
        if (!type) return 'N/A';
        return <Tag color={type === 'CRYPTO' ? 'warning' : 'processing'}>{type}</Tag>;
      }
    }
  ];

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          User Management
          <span className="badge-soft-primary" style={{ marginLeft: 10 }}>TOTAL {users.length}</span>
        </div>
        <div className="admin-card-body p-0">
          <div style={{ padding: '1.5rem' }}>
            <Table
              className="modern-antd-table"
              columns={columns}
              dataSource={users}
              rowKey="id"
              loading={loading}
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '20', '50'],
              }}
              scroll={{ x: 1000 }}
            />
          </div>
        </div>
      </div>

      <Modal
        title={`User Donation History - ${selectedUser?.email?.split('@')[0] || ''}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={[
          <AntDButton key="close" onClick={() => setModalOpen(false)}>
            Close
          </AntDButton>,
          <AntDButton key="export" type="primary" icon={<DownloadOutlined />}>
            Export Report
          </AntDButton>
        ]}
        width={800}
      >
        {selectedUser && (
          <Row gutter={16} style={{ marginBottom: 24, marginTop: 16 }}>
            <Col span={12}>
              <Card size="small">
                <Statistic
                  title="Total Donated"
                  value={history.reduce((sum, h) => sum + parseFloat(h.amount || 0), 0)}
                  precision={2}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#7c4dff' }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small">
                <Statistic
                  title="Joined On"
                  value={new Date(selectedUser.created_at).toLocaleDateString()}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#10b981', fontSize: '1.25rem' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        <h3 style={{ marginBottom: 16, fontSize: '1rem' }}><HistoryOutlined /> RECENT DONATIONS</h3>
        
        <Table
          columns={historyColumns}
          dataSource={history}
          rowKey="id"
          loading={historyLoading}
          pagination={{ pageSize: 5 }}
          scroll={{ x: 700 }}
          locale={{ emptyText: "No confirmed donations found for this user." }}
        />
      </Modal>
    </div>
  );
};

export default AdminUsers;
