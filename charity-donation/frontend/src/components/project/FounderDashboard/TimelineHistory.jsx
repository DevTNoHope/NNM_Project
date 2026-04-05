import React, { useState } from "react";
import "./TimelineHistory.css";
export default function TimelineHistory({ updates }) {
  const [lightboxImg, setLightboxImg] = useState(null);
  return (
    <div className="card" style={{ minWidth: 0 }}>
      <h2 className="card-title">Timeline History ({updates.length})</h2>
      {updates.length === 0 ? (
        <p className="empty-text">No updates posted yet.</p>
      ) : (
        <div className="updates-list">
          {updates.map(u => (
            <div key={u.id} className="th-update-item">
              <div className="update-date">
                {new Date(u.created_at).toLocaleDateString()}
              </div>
              <h4 className="update-title">{u.title}</h4>
              <div className="update-content" dangerouslySetInnerHTML={{ __html: u.content }} />
              {u.image_url && (
                <img 
                  src={u.image_url} 
                  alt="Update" 
                  className="update-img clickable-img" 
                  onClick={() => setLightboxImg(u.image_url)} 
                />
              )}
            </div>
          ))}
        </div>
      )}

      {lightboxImg && (
        <div className="image-lightbox" onClick={() => setLightboxImg(null)}>
          <button className="image-lightbox__close" onClick={(e) => { e.stopPropagation(); setLightboxImg(null); }}>
            &times;
          </button>
          <img src={lightboxImg} alt="Enlarged view" className="image-lightbox__img" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
