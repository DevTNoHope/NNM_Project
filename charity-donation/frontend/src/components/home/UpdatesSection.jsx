import { useRef, useEffect } from 'react';
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
  const carouselRef = useRef(null);
  const scrollInterval = useRef(null);

  const startAutoScroll = () => {
    stopAutoScroll();
    scrollInterval.current = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 5) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 4000); // 4 seconds for updates
  };

  const stopAutoScroll = () => {
    if (scrollInterval.current) clearInterval(scrollInterval.current);
  };

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [safeUpdates]);

  return (
    <section className="updates-section">
      <div className="container">
        <h3 className="updates-section__title">Last Updates</h3>
        <div 
          className="updates-section__carousel hide-scrollbar" 
          ref={carouselRef}
          onMouseEnter={stopAutoScroll}
          onMouseLeave={startAutoScroll}
          style={{ 
            display: 'flex', 
            gap: '20px', 
            overflowX: 'auto', 
            paddingBottom: '20px',
            scrollBehavior: 'smooth'
          }}
        >
          {safeUpdates.map(u => (
            <div key={u.id} className="update-item" style={{ flex: '0 0 300px' }}>
              <div className="update-item__image">
                <img src={u.cover_image_url} alt={u.title} loading="lazy" />
              </div>
              <div className="update-item__body">
                <p className="update-item__date">{timeAgo(u.updated_at)}</p>
                <p className="update-item__title">{u.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpdatesSection;