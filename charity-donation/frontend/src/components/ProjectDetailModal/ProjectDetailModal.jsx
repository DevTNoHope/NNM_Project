import React, { useState } from "react";
// Remove custom css as we rely on global modern modal styles in AdminLayout.css
// import "./ProjectDetailModal.css"; 

const ProjectDetailModal = ({ project, onClose, onApprove, onReject }) => {
  const [note, setNote] = useState("");

  if (!project) return null;

  const getStatusBadge = (status) => {
    switch(status) {
      case 'APPROVED': return <span className="badge-soft-success">APPROVED</span>;
      case 'REJECTED': return <span className="badge-soft-danger">REJECTED</span>;
      case 'PENDING': return <span className="badge-soft-warning">PENDING</span>;
      default: return <span className="badge-soft-secondary">{status}</span>;
    }
  };

  const goal = parseInt(project.goal_amount) || 0;
  const donated = parseFloat(project.total_donated) || 0;
  const percent = goal > 0 ? Math.min(Math.round((donated / goal) * 100), 100) : 0;

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-modern" style={{ width: '800px', maxWidth: '95%' }}>
        <div className="modal-header-modern">
           <div>
              <h5>Project Details: {project.title}</h5>
              <p>Review project information before making a decision.</p>
           </div>
           <button className="modal-close-icon" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body-modern" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
            {/* Image Section */}
            <div style={{ width: '300px', flexShrink: 0 }}>
              {project.cover_image_url ? (
                <img 
                   src={project.cover_image_url} 
                   alt={project.title} 
                   style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #E5E7EB' }} 
                />
              ) : (
                <div style={{ width: '100%', height: '200px', background: '#F3F4F6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', border: '1px dashed #D1D5DB' }}>
                   No Cover Image
                </div>
              )}
            </div>
            
            {/* Info Section */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignContent: 'start' }}>
               <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Status:</div>
                  <div>{getStatusBadge(project.status)}</div>
               </div>
               <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Category:</div>
                  <div style={{ fontWeight: 600, color: '#111827' }}>{project.category_name || "Education"}</div>
               </div>
               <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Founder ID:</div>
                  <div style={{ fontWeight: 600, color: '#111827' }}>{project.founder_id}</div>
               </div>
               <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Goal Amount:</div>
                  <div style={{ fontWeight: 700, color: '#20a8d8' }}>${goal.toLocaleString()}</div>
               </div>
               <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Created At:</div>
                  <div style={{ fontSize: '0.85rem', color: '#4B5563' }}>{new Date(project.created_at).toLocaleString()}</div>
               </div>
               <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>Updated At:</div>
                  <div style={{ fontSize: '0.85rem', color: '#4B5563' }}>{new Date(project.updated_at).toLocaleString()}</div>
               </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem', background: '#F9FAFB', padding: '1rem', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
              <span style={{ color: '#4B5563' }}>Raised: ${donated.toLocaleString()}</span>
              <span style={{ color: '#111827' }}>{percent}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ height: '100%', width: `${percent}%`, backgroundColor: percent >= 100 ? '#10B981' : '#20a8d8', transition: 'width 0.3s' }}
              ></div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Description:</div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.6, background: '#F9FAFB', padding: '1rem', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
               {project.description || "No description provided."}
            </p>
          </div>

          {project.status === 'PENDING' && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                 Decision Note (Optional for Approve, Required for Reject):
              </div>
              <textarea 
                rows="3" 
                value={note} 
                onChange={(e) => setNote(e.target.value)} 
                placeholder="Reason for your decision..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontFamily: 'inherit', fontSize: '0.9rem', resize: 'vertical' }}
              ></textarea>
            </div>
          )}
        </div>

        <div className="modal-footer-modern">
          <button className="btn-core" style={{ background: 'transparent', color: '#6B7280', border: '1px solid #D1D5DB' }} onClick={onClose}>Close</button>
          
          {project.status === 'PENDING' && (
            <>
              <button 
                className="btn-core btn-danger"
                style={{ background: '#FEE2E2', color: '#DC2626' }}
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
