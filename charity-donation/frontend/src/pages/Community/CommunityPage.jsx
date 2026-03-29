import { Link } from 'react-router-dom';
import Button from '@/components/common/Button';
import './CommunityPage.css';

const BENEFITS = [
  { icon: '🗳️', title: 'Governance Voting', desc: 'Vote on platform decisions, funding rounds, and feature priorities.' },
  { icon: '🌱', title: 'Quadratic Funding', desc: 'Your small donation gets amplified by the community matching pool.' },
  { icon: '📢', title: 'Project Advocacy', desc: 'Champion causes you care about and bring them to the community.' },
  { icon: '🎁', title: 'Donor Rewards', desc: 'Earn badges, NFTs, and recognition for your contributions.' },
  { icon: '🤝', title: 'Connect with Makers', desc: 'Meet project founders and fellow givers who share your values.' },
  { icon: '📊', title: 'Transparency Reports', desc: 'Access detailed impact reports for every project on the platform.' },
];

const STEPS = [
  { step: '01', title: 'Create an Account', desc: 'Sign up with email or connect your Web3 wallet.' },
  { step: '02', title: 'Explore Projects', desc: 'Browse verified projects across categories you care about.' },
  { step: '03', title: 'Make Your First Donation', desc: 'Give any amount — every donation counts toward matching.' },
  { step: '04', title: 'Join the Conversation', desc: 'Share updates, vote, and connect with fellow givers.' },
];

const CommunityPage = () => (
  <div className="community-page">
    <section className="community-hero">
      <div className="container">
        <h1 className="community-hero__title">Join a Global Movement</h1>
        <p className="community-hero__sub">Over 25,000 givers are already making an impact. Be part of something bigger.</p>
        <div className="community-hero__stats">
          {[['25,713', 'Members'], ['7,590', 'Projects'], ['$5M+', 'Raised']].map(([val, lbl]) => (
            <div key={lbl} className="comm-stat">
              <span className="comm-stat__val">{val}</span>
              <span className="comm-stat__lbl">{lbl}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="community-benefits">
      <div className="container">
        <h2 className="community-section-title">Why Join Our Community?</h2>
        <div className="community-benefits__grid">
          {BENEFITS.map(b => (
            <div key={b.title} className="benefit-card">
              <div className="benefit-card__icon">{b.icon}</div>
              <h3 className="benefit-card__title">{b.title}</h3>
              <p className="benefit-card__desc">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="community-steps">
      <div className="container">
        <h2 className="community-section-title">How to Get Started</h2>
        <div className="community-steps__grid">
          {STEPS.map(s => (
            <div key={s.step} className="step-card">
              <div className="step-card__num">{s.step}</div>
              <h3 className="step-card__title">{s.title}</h3>
              <p className="step-card__desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="community-cta">
      <div className="container">
        <div className="community-cta__inner">
          <h2>Ready to Make a Difference?</h2>
          <p>Join thousands of givers already transforming the world through HopeFund.</p>
          <div className="community-cta__btns">
            <Button as={Link} to="/projects" variant="accent" size="lg">Start Giving →</Button>
            <Button as={Link} to="/about" variant="outline" size="lg">Learn More</Button>
          </div>
        </div>
      </div>
    </section>
  </div>
);
export default CommunityPage;