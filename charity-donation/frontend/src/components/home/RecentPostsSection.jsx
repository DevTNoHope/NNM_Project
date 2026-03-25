import { Link } from 'react-router-dom';
import ProjectCard from '../ProjectCard';
import { formatCurrency } from '../../utils/formatCurrency';
import './RecentPostsSection.css';

const RecentPostsSection = ({ posts, topDonations }) => {
  const safePosts = Array.isArray(posts) ? posts : [];
  const safeDonations = Array.isArray(topDonations) ? topDonations : [];

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
            <div className="top-donations__marquee">
              <div className="top-donations__track">
                {/* Original set */}
                {safeDonations.map(d => (
                  <div key={`d1-${d.id}`} className="donation-item">
                    <div className="donation-item__amount">{formatCurrency(d.amount)}</div>
                    <div className="donation-item__user">
                      by {d.user_name || d.donor_wallet || 'Anonymous'}
                    </div>
                    <div className="donation-item__project">To: {d.project_title}</div>
                  </div>
                ))}
                {/* Duplicated set for seamless loop */}
                {safeDonations.map(d => (
                  <div key={`d2-${d.id}`} className="donation-item">
                    <div className="donation-item__amount">{formatCurrency(d.amount)}</div>
                    <div className="donation-item__user">
                      by {d.user_name || d.donor_wallet || 'Anonymous'}
                    </div>
                    <div className="donation-item__project">To: {d.project_title}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentPostsSection;