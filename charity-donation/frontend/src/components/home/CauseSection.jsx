import { Link } from 'react-router-dom';
import Button from '../common/Button';
import './CauseSection.css';

const CauseSection = ({ projects }) => {
  const latestProject = Array.isArray(projects) && projects.length > 0 ? projects[0] : null;

  return (
    <section className="cause-section">
      <div className="container">
        <div className="cause-section__inner">
          <div className="cause-section__content">
            <h2 className="cause-section__title">New Releases: {latestProject?.title || 'Inspiring Projects'}</h2>
            <p className="cause-section__desc">
              {latestProject 
                ? `Join us in supporting "${latestProject.title}", one of our newest initiatives to drive change.`
                : 'Discover and support the latest project releases on our platform.'}
            </p>
            <Button as={Link} to="/projects" variant="primary" size="md">Explore All →</Button>
          </div>
          <div className="cause-section__visual">
            <div className="cause-card">
              <div className="cause-card__header">
                <span>🌿 HopeFund</span>
                <span className="cause-card__label">New Release</span>
              </div>
              <div className="cause-card__img-main">
                {latestProject?.cover_image_url ? (
                  <img src={latestProject.cover_image_url} alt={latestProject.title} style={{ width: '100%', borderRadius: '8px', marginTop: '10px' }} />
                ) : (
                  <div className="cause-card__imgs" style={{ marginTop: '20px' }}>
                    <div className="cause-img">💧</div>
                    <div className="cause-img">🌱</div>
                    <div className="cause-img">📚</div>
                  </div>
                )}
              </div>
              <p className="cause-card__sub" style={{ marginTop: '15px' }}>
                {latestProject ? `Goal: $${Number(latestProject.goal_amount).toLocaleString()}` : 'A collection of projects with donations managed by an AI agent.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default CauseSection;