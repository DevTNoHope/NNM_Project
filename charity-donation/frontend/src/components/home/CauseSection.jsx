import { Link } from 'react-router-dom';
import Button from '../common/Button';
import './CauseSection.css';

const CauseSection = () => (
  <section className="cause-section">
    <div className="container">
      <div className="cause-section__inner">
        <div className="cause-section__content">
          <h2 className="cause-section__title">Cause: The next evolution of giving is here!</h2>
          <p className="cause-section__desc">Create a collection of impact projects or donate to one that inspires you.</p>
          <Button as={Link} to="/projects" variant="primary" size="md">Explore →</Button>
        </div>
        <div className="cause-section__visual">
          <div className="cause-card">
            <div className="cause-card__header">
              <span>🌿 HopeFund</span>
              <span className="cause-card__label">Causes</span>
            </div>
            <p className="cause-card__sub">A collection of projects with donations managed by an AI agent.</p>
            <div className="cause-card__imgs">
              <div className="cause-img">💧</div>
              <div className="cause-img">🌱</div>
              <div className="cause-img">📚</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
export default CauseSection;