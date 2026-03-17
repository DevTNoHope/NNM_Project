import React, { useState } from "react";
import "./ProjectDetailModal.css";

const ProjectDetailModal = ({ project, onClose, onApprove, onReject }) => {
  const [note, setNote] = useState("");

  if (!project) return null;

  const getStatusBadge = (status) => {
    switch(status) {
      case 'APPROVED': return <span className="badge btn-success">APPROVED</span>;
      case 'REJECTED': return <span className="badge btn-danger">REJECTED</span>;
      case 'PENDING': return <span className="badge btn-warning">PENDING</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const goal = parseInt(project.goal_amount) || 0;
  const donated = parseFloat(project.total_donated) || 0;
  const percent = goal > 0 ? Math.min(Math.round((donated / goal) * 100), 100) : 0;

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal project-detail-modal">
        <div className="admin-modal-header">
          <h5>Project Details: {project.title}</h5>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="admin-modal-body">
          <div className="pdm-top-section">
            <div className="pdm-image-wrapper">
              {project.cover_image_url ? (
                <img src={project.cover_image_url} alt={project.title} className="pdm-image" />
              ) : (
                <div className="pdm-no-image">No Cover Image</div>
              )}
            </div>
            
            <div className="pdm-info-grid">
              <div className="pdm-info-item">
                <label>Status:</label>
                <div>{getStatusBadge(project.status)}</div>
              </div>
              <div className="pdm-info-item">
                <label>Category:</label>
                <div><strong>{project.category_name || "Unknown"}</strong></div>
              </div>
              <div className="pdm-info-item">
                <label>Founder ID:</label>
                <div>{project.founder_id}</div>
              </div>
              <div className="pdm-info-item">
                <label>Goal Amount:</label>
                <div style={{ color: '#20a8d8', fontWeight: 'bold' }}>{goal.toLocaleString()} VND</div>
              </div>
              <div className="pdm-info-item">
                <label>Created At:</label>
                <div>{new Date(project.created_at).toLocaleString()}</div>
              </div>
              <div className="pdm-info-item">
                <label>Updated At:</label>
                <div>{new Date(project.updated_at).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="pdm-progress">
            <div className="pdm-progress-labels">
              <span>Raised: {donated.toLocaleString()} VND</span>
              <span>{percent}%</span>
            </div>
            <div className="pdm-progress-bar-bg">
              <div 
                className="pdm-progress-bar-fill" 
                style={{ width: `${percent}%`, backgroundColor: percent >= 100 ? '#4dbd74' : '#20a8d8' }}
              ></div>
            </div>
          </div>

          <div className="pdm-description">
            <label>Description:</label>
            <p>{project.description || "No description provided."}</p>
          </div>

          {project.status === 'PENDING' && (
            <div className="pdm-action-section">
              <label>Decision Note (Optional for Approve, Required for Reject):</label>
              <textarea 
                rows="3" 
                value={note} 
                onChange={(e) => setNote(e.target.value)} 
                placeholder="Reason for your decision..."
              ></textarea>
            </div>
          )}
        </div>

        <div className="admin-modal-footer">
          <button className="btn-core" style={{ backgroundColor: '#c8ced3', color: '#23282c' }} onClick={onClose}>Close</button>
          
          {project.status === 'PENDING' && (
            <>
              <button 
                className="btn-core btn-danger"
                onClick={() => onReject(project.id, note)}
              >
                Reject
              </button>
              <button 
                className="btn-core btn-success"
                onClick={() => onApprove(project.id, note)}
              >
                Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
