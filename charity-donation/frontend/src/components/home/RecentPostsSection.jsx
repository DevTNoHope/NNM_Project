import { Link } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import ProjectCard from '../ProjectCard';
import { formatCurrency } from '../../utils/formatCurrency';
import './RecentPostsSection.css';

const RecentPostsSection = ({ posts, topDonations }) => {
  const safePosts = Array.isArray(posts) ? posts : [];
  const safeDonations = Array.isArray(topDonations) ? topDonations : [];
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
    }, 3000);
  };

  const stopAutoScroll = () => {
    if (scrollInterval.current) clearInterval(scrollInterval.current);
  };

  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [safeDonations]);

  return (
    <section className="recent-posts">
      <div className="container">
        <div className="recent-posts__header">
          <h2 className="recent-posts__title">Recent projects</h2>
          <Link to="/projects" className="recent-posts__link">Visit Our Projects →</Link>
        </div>
        
        <div className="recent-posts__grid">
          {safePosts.length > 0 ? (
            safePosts.map(p => <ProjectCard key={p.id} project={p} />)
          ) : (
            <p className="no-data">No recent projects available.</p>
          )}
        </div>

        {safeDonations.length > 0 && (
          <div className="top-donations" style={{ marginTop: '60px' }}>
            <h3 className="recent-posts__title" style={{ fontSize: '1.5rem', marginBottom: '30px' }}>Top Donations</h3>
            <div 
              className="top-donations__carousel hide-scrollbar" 
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
              {safeDonations.map(d => (
                <div key={d.id} className="donation-item" style={{ 
                  flex: '0 0 300px',
                  background: 'rgba(255,255,255,0.03)', 
                  padding: '20px', 
                  borderRadius: '12px', 
                  border: '1px solid rgba(255,255,255,0.05)' 
                }}>
                  <div style={{ fontWeight: '600', color: '#4f46e5', fontSize: '1.1rem' }}>{formatCurrency(d.amount)}</div>
                  <div style={{ fontSize: '0.9rem', color: '#9ca3af', marginBottom: '8px' }}>
                    by {d.user_name || d.donor_wallet || 'Anonymous'}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>To: {d.project_title}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentPostsSection;