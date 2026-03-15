import React from "react";
import "./TimelineHistory.css";
export default function TimelineHistory({ updates }) {
  return (
    <div className="card">
      <h2 className="card-title">Timeline History</h2>
      {updates.length === 0 ? (
        <p className="empty-text">No updates posted yet.</p>
      ) : (
        <div className="updates-list">
          {updates.map(u => (
            <div key={u.id} className="update-item">
              <div className="update-date">
                {new Date(u.created_at).toLocaleDateString()}
              </div>
              <h4 className="update-title">{u.title}</h4>
              <p className="update-content">{u.content}</p>
              {u.image_url && <img src={u.image_url} alt="Update" className="update-img" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
