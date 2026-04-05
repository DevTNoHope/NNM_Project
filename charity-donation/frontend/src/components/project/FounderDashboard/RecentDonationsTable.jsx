import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { CiShare1 } from "react-icons/ci";
import { getTxUrl } from "@/utils/constants";
import "./RecentDonationsTable.css";

export default function RecentDonationsTable({ donations = [] }) {
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="sort-icon" />;
    if (sortOrder === "asc") return <FaSortUp className="sort-icon active" />;
    return <FaSortDown className="sort-icon active" />;
  };

  const sortedDonations = useMemo(() => {
    return [...donations].sort((a, b) => {
      if (sortField === "date") {
        const d1 = new Date(a.created_at || a.date);
        const d2 = new Date(b.created_at || b.date);
        return sortOrder === "asc" ? d1 - d2 : d2 - d1;
      }

      if (sortField === "amount") {
        const n1 = Number(a.amount);
        const n2 = Number(b.amount);
        return sortOrder === "asc" ? n1 - n2 : n2 - n1;
      }

      if (sortField === "donor") {
        const nameA = (a.donor_name || "Anonymous").toLowerCase();
        const nameB = (b.donor_name || "Anonymous").toLowerCase();
        return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }

      return 0;
    });
  }, [donations, sortField, sortOrder]);

  return (
    <div className="card">
      <h2 className="card-title">Recent Donations</h2>
      {donations.length === 0 ? (
        <p className="empty-text">No donations yet.</p>
      ) : (
        <div className="donation-table" style={{ marginTop: '16px' }}>
          <div className="donation-head">
            <span
              className="sortable"
              onClick={() => handleSort("date")}
            >
              Date {renderSortIcon("date")}
            </span>
            <span
              className="sortable"
              onClick={() => handleSort("donor")}
            >
              Donor {renderSortIcon("donor")}
            </span>
            <span>Type</span>
            <span
              className="sortable"
              onClick={() => handleSort("amount")}
            >
              Amount {renderSortIcon("amount")}
            </span>
          </div>

          {sortedDonations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((item) => {
            const isCrypto = item.donation_type === "CRYPTO";
            const txUrl = item.tx_hash
              ? getTxUrl(item.tx_hash)
              : null;

            return (
              <div className="donation-row" key={item.id}>
                <span>
                  {new Date(item.created_at).toLocaleDateString()}
                </span>

                <span>
                  {item.user_id ? (
                    <Link
                      to={`/profile/${item.user_id}`}
                      className="donation-project-link"
                    >
                      {item.donor_name || "Anonymous"}
                    </Link>
                  ) : (
                    item.donor_name || item.donor_wallet || "Anonymous"
                  )}
                </span>

                <span>{item.donation_type}</span>

                <span className="donation-amount-cell">
                  <span style={{ color: '#16a34a', fontWeight: '600' }}>
                    ${Number(item.amount).toLocaleString("en-US")}
                  </span>
                  {isCrypto && txUrl && (
                    <a
                      href={txUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="tx-link"
                      title="View transaction"
                    >
                      <CiShare1 />
                    </a>
                  )}
                </span>
              </div>
            );
          })}

          {sortedDonations.length > PAGE_SIZE && (
            <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                style={{ cursor: page === 1 ? 'not-allowed' : 'pointer', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', background: page === 1 ? '#f9fafb' : '#fff', color: page === 1 ? '#9ca3af' : '#374151', fontSize: '0.875rem' }}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#4b5563' }}>
                Page {page} of {Math.ceil(sortedDonations.length / PAGE_SIZE)}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(Math.ceil(sortedDonations.length / PAGE_SIZE), p + 1))} 
                disabled={page === Math.ceil(sortedDonations.length / PAGE_SIZE)}
                style={{ cursor: page === Math.ceil(sortedDonations.length / PAGE_SIZE) ? 'not-allowed' : 'pointer', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', background: page === Math.ceil(sortedDonations.length / PAGE_SIZE) ? '#f9fafb' : '#fff', color: page === Math.ceil(sortedDonations.length / PAGE_SIZE) ? '#9ca3af' : '#374151', fontSize: '0.875rem' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
