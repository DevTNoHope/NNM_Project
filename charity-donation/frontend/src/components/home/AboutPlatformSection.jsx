import { Link } from 'react-router-dom';
import Button from '@/components/common/Button';
import './AboutPlatformSection.css';

const AboutPlatformSection = () => (
  <section className="about-plat">
    <div className="container">
      <div className="about-plat__inner">
        <div className="about-plat__content">
          <h2 className="about-plat__title">What is HopeFund?</h2>
          <p className="about-plat__desc">
            Discover what makes HopeFund different from other crypto donation platforms.
            We combine blockchain transparency with community governance and Quadratic Funding
            to maximize your impact.
          </p>
          <Button as={Link} to="/about" variant="outline" size="md">More About Us →</Button>
        </div>
        <div className="about-plat__visual">
          <div className="about-plat-card">
            <div className="about-plat-card__header">
              <span>🌿 HopeFund</span>
              <span>Causes</span>
            </div>
            <p className="about-plat-card__sub">A collection of projects with donations managed by an AI agent.</p>
            <div className="about-plat-card__imgs">
              <div className="about-plat-img">💰</div>
              <div className="about-plat-img">🤝</div>
              <div className="about-plat-img">🌍</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
export default AboutPlatformSection;