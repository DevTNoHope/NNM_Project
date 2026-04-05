import React, { useEffect, useState, useRef } from 'react';
import { Table, Space, Tag, Input, Button as AntDButton } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Button from '@/components/common/Button';
import { alertSuccess, alertError, alertConfirm } from '@/utils/alert';
import withdrawApi from '@/api/withdraw.api';
import Spinner from '@/components/common/Spinner';
import './WithdrawalManagement.css';

const WithdrawalManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Custom Table Filter State
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await withdrawApi.getRequests(); // Admin gets all
      const all = res.data?.data || [];
      // Only show PENDING requests for management
      setRequests(all.filter(r => r.status === 'PENDING'));
    } catch (err) {
      setError('Failed to fetch withdrawal requests');
      alertError('Error', 'Failed to fetch withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (request) => {
    const confirmed = await alertConfirm({
      title: 'Approve Withdrawal Request',
      text: `Are you sure you want to approve this request for $${Number(request.amount).toLocaleString()}?`,
      confirmText: 'Approve',
    });
    if (!confirmed) return;
    setActionLoading(request.id);
    try {
      await withdrawApi.approveRequest({ withdrawRequestId: request.id });
      alertSuccess('Approved!', 'Withdrawal approved successfully!');
      fetchRequests();
    } catch (err) {
      alertError('Error', err.response?.data?.message || 'Error during approval');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (request) => {
    const confirmed = await alertConfirm({
      title: 'Reject Withdrawal Request',
      text: 'Are you sure you want to reject this request?',
      confirmText: 'Reject',
      isDanger: true,
    });
    if (!confirmed) return;
    setActionLoading(request.id);
    try {
      await withdrawApi.rejectRequest({ withdrawRequestId: request.id });
      alertSuccess('Rejected!', 'Request rejected!');
      fetchRequests();
    } catch (err) {
      alertError('Error', err.response?.data?.message || 'Error during rejection');
    } finally {
      setActionLoading(null);
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
      width: 70,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      sorter: (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0),
      render: (date) => <span>{date ? new Date(date).toLocaleDateString() : "-"}</span>,
    },
    {
      title: "Project",
      dataIndex: "project_title",
      key: "project",
      ...getColumnSearchProps("project_title"),
      render: (text, record) => <span style={{ fontWeight: 600, color: '#111827' }}>{text || `ID: ${record.project_id}`}</span>,
    },
    {
      title: "Founder",
      key: "founder",
      render: (_, record) => (
        <div style={{ lineHeight: '1.2' }}>
          <div style={{ fontWeight: 500 }}>{record.founder_name || 'N/A'}</div>
          <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{record.founder_email}</div>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type === 'CRYPTO' ? 'cyan' : 'gold'}>{type}</Tag>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => Number(a.amount || 0) - Number(b.amount || 0),
      render: (val) => <span style={{ color: '#10b981', fontWeight: 700 }}>${Number(val || 0).toLocaleString()}</span>,
    },
    {
      title: "Bank Details",
      key: "bank_details",
      render: (_, record) => {
        if (record.type === 'BANKING') {
          return (
            <div style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
              <div><strong>Bank:</strong> {record.bank_name}</div>
              <div><strong>Acc:</strong> {record.account_number}</div>
              <div><strong>Name:</strong> {record.account_name}</div>
            </div>
          );
        }
        return '-';
      }
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      render: (note) => <span style={{ fontStyle: 'italic', fontSize: '0.8rem', color: '#6B7280' }}>{note || '-'}</span>,
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleApprove(record)}
            disabled={actionLoading === record.id}
            style={{ backgroundColor: '#10B981', boxShadow: 'none' }}
          >
            {actionLoading === record.id ? '...' : 'Approve'}
          </Button>
          <Button
            size="sm"
            onClick={() => handleReject(record)}
            disabled={actionLoading === record.id}
            style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
          >
            {actionLoading === record.id ? '...' : 'Reject'}
          </Button>
        </div>
      ),
    },
  ];

  if (loading) return <Spinner center size="lg" />;

  return (
    <div className="admin-withdrawal-mgmt">
      <div className="admin-card">
        <div className="admin-card-header">
          Withdrawal Requests Management
          <span className="badge-soft-primary" style={{ marginLeft: 10 }}>PENDING {requests.length}</span>
        </div>
        <div className="admin-card-body p-0">
          {error && <div style={{ padding: '1rem', color: '#ef4444' }}>{error}</div>}

          <div style={{ padding: '1.5rem' }}>
            <Table
              className="modern-antd-table"
              columns={columns}
              dataSource={requests}
              rowKey="id"
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['5', '10', '20', '50'],
              }}
              scroll={{ x: 1000 }}
              locale={{ emptyText: "No pending withdrawal requests found." }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalManagement;
