import React from "react";
import "./RecentDonationsTable.css";
export default function RecentDonationsTable({ donations }) {
  return (
    <div className="card">
      <h2 className="card-title">Recent Donations</h2>
      {donations.length === 0 ? (
        <p className="empty-text">No donations yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="donations-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {donations.slice(0, 10).map((d) => (
                <tr key={d.id}>
                  <td className="font-medium">{d.donor_name || d.donor_wallet || "Anonymous"}</td>
                  <td className="font-semibold text-green-600">{Number(d.amount).toLocaleString()} VNĐ</td>
                  <td>{d.donation_type}</td>
                  <td className="text-gray-500">
                    {new Date(d.created_at).toLocaleDateString()}
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
