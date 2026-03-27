import React from 'react';
import './UpdatesSection.css';

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

const UpdatesSection = ({ updates }) => {
  const safeUpdates = Array.isArray(updates) ? updates : [];

  return (
    <section className="updates-section">
      <div className="container">
        <h3 className="updates-section__title">Last Updates</h3>
        <div className="updates-section__marquee">
          <div className="updates-section__track">
            {/* Original set */}
            {safeUpdates.map(u => (
              <div key={`u1-${u.id}`} className="update-item">
                <div className="update-item__image">
                  <img 
                    src={u.cover_image_url || "https://via.placeholder.com/300x200?text=Update"} 
                    alt={u.title} 
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/300x200?text=Update" }} 
                  />
                </div>
                <div className="update-item__body">
                  <p className="update-item__date">{timeAgo(u.updated_at)}</p>
                  <p className="update-item__title">{u.title}</p>
                </div>
              </div>
            ))}
            {/* Duplicated set */}
            {safeUpdates.map(u => (
              <div key={`u2-${u.id}`} className="update-item">
                <div className="update-item__image">
                  <img 
                    src={u.cover_image_url || "https://via.placeholder.com/300x200?text=Update"} 
                    alt={u.title} 
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/300x200?text=Update" }} 
                  />
                </div>
                <div className="update-item__body">
                  <p className="update-item__date">{timeAgo(u.updated_at)}</p>
                  <p className="update-item__title">{u.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UpdatesSection;