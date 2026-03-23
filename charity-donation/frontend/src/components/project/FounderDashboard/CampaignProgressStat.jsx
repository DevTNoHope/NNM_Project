import React from "react";
import "./CampaignProgressStat.css";
export default function CampaignProgressStat({ project, totalDonated, donationsCount, onWithdraw }) {
  if (!project) return null;

  const progressPercent = Math.min(100, (totalDonated / Number(project.goal_amount)) * 100);

  return (
    <div className="card stat-card">
      <h2 className="card-title">Campaign Progress</h2>
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
      </div>
      <div className="stat-flex">
        <div>
          <p className="stat-label">Total Raised</p>
          <p className="stat-value">${totalDonated.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="stat-label">Goal Amount</p>
          <p className="stat-value">${Number(project.goal_amount).toLocaleString()}</p>
        </div>
      </div>
      <div className="stat-extra">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="status-badge">{project.status}</span>
          <span className="info-text">{donationsCount} total transaction(s)</span>
        </div>
        {project.status === 'PUBLISHED' && (
          <button 
            className="withdraw-btn-small" 
            onClick={onWithdraw}
          >
            Withdraw
          </button>
        )}
      </div>
    </div>
  );
}
