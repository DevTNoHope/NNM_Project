import React, { useEffect } from "react";
import Button from "@/components/common/Button";
import './ProjectDetailsModal.css';

export default function ProjectDetailsModal({ project, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!project) return null;

  return (
    <div 
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="modal project-detail-modal" 
        role="dialog" 
        aria-modal="true"
      >
        <button 
          className="modal__close project-detail-close" 
          onClick={onClose} 
          aria-label="Close"
        >
          ✕
        </button>

        {/* Left Side: Header Image exactly filling the container height */}
        <div className="project-detail-img-container">
          {project.cover_image_url ? (
            <img 
              src={project.cover_image_url} 
              alt={project.title} 
              className="project-detail-img"
            />
          ) : (
            <div className="project-detail-placeholder">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>No Cover Image Provide</span>
            </div>
          )}
        </div>

        {/* Right Side: Content */}
        <div className="project-detail-content">
          {/* Mobile Image */}
          <div className="project-detail-mobile-img">
             {project.cover_image_url ? (
              <img src={project.cover_image_url} alt={project.title} className="project-detail-img" />
            ) : (
              <div className="project-detail-placeholder">No Image</div>
            )}
          </div>

          <div className="project-detail-header">
            <h2 className="project-detail-title">{project.title}</h2>
            <div className="project-detail-meta">
              <p className="project-detail-category">{project.category_name}</p>
              <span className={`project-detail-status
                ${project.status === 'PUBLISHED' ? 'status-published' : 'status-default'}
              `}>
                {project.status}
              </span>
            </div>
          </div>

          <div className="project-detail-body">
            <div className="project-detail-stats">
              <div className="stat-col">
                <span className="stat-label-mini">Goal</span>
                <span className="stat-value-mini">${Number(project.goal_amount || 0).toLocaleString()}</span>
              </div>
              <div className="stat-col stat-col-middle">
                <span className="stat-label-mini">Raised</span>
                <span className="stat-value-mini stat-value-primary">${Number(project.total_donated || 0).toLocaleString()}</span>
              </div>
              <div className="stat-col">
                <span className="stat-label-mini">Donors</span>
                <span className="stat-value-mini">{Number(project.total_donors || 0).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <h3 className="section-label">
                 <span className="section-indicator"></span> Description
              </h3>
              <div className="project-detail-desc" dangerouslySetInnerHTML={{ __html: project.description || "No description provided." }}>
              </div>
            </div>
          </div>

          <div className="project-detail-footer">
            <Button variant="outline" size="md" onClick={onClose} className="btn-full-width">
              Close Window
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
