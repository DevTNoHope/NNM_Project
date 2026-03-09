import FeatureCard from '../project/FeatureCard';
import './FeatureSection.css';

const FEATURES = [
  { icon: '🛡️', title: 'Verified Projects', description: 'Trust that your crypto donations will make an impact with our rigorous verification system.', link: '/about', linkLabel: 'How It Works' },
  { icon: '🎁', title: 'Donor Rewards', description: 'Trust that your crypto donations will make an impact with our verification system.', link: '/community', linkLabel: 'Learn More' },
  { icon: '⚡', title: 'Easy Onboarding', description: 'Trust that your crypto donations will make an impact with our verification system.', link: '/projects', linkLabel: 'Get Started' },
];

const FeatureSection = () => (
  <section className="feature-section">
    <div className="container">
      <div className="feature-section__grid">
        {FEATURES.map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </div>
  </section>
);
export default FeatureSection;