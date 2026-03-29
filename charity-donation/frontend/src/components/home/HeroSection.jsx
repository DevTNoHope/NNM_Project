import { Link } from 'react-router-dom';
import Button from '@/components/common/Button';
import './HeroSection.css';

const HeroSection = ({ stats }) => (
  <section className="hero">
    <div className="container">
      <div className="hero__inner">

        {/* ── Left: text content ── */}
        <div className="hero__content">
          <span className="hero__badge">🎗 Community-Driven Giving</span>
          <h1 className="hero__title">
            HopeFund empowers<br />
            changemakers to<br />
            <span className="hero__title--grad">accept crypto donations</span>
          </h1>
          <p className="hero__desc">
            Join our community-driven movement to transform the way we fund nonprofits
            and social causes using innovative crypto fundraising strategies.
          </p>
          <div className="hero__actions">
            <Button as={Link} to="/projects" variant="accent" size="lg">Explore Projects →</Button>
            <Button as={Link} to="/about"    variant="ghost"  size="lg">Learn More</Button>
          </div>
        </div>

        {/* ── Right: illustration ── */}
        <div className="hero__visual">
          <div className="hero__globe">
            <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="160" cy="160" r="148" fill="rgba(79,70,229,0.05)" stroke="rgba(79,70,229,0.12)" strokeWidth="1.5"/>
              <circle cx="160" cy="160" r="110" fill="rgba(124,58,237,0.05)" stroke="rgba(124,58,237,0.12)" strokeWidth="1.5"/>
              <circle cx="160" cy="160" r="74"  fill="rgba(99,102,241,0.07)" stroke="rgba(99,102,241,0.18)" strokeWidth="1"/>
              <ellipse cx="160" cy="160" rx="110" ry="60" stroke="rgba(79,70,229,0.18)" strokeWidth="1.5" fill="none"/>
              <ellipse cx="160" cy="160" rx="110" ry="110" stroke="rgba(79,70,229,0.08)" strokeWidth="1" fill="none" strokeDasharray="6 4"/>
              <line x1="160" y1="50" x2="160" y2="270" stroke="rgba(79,70,229,0.12)" strokeWidth="1.5"/>
            </svg>
            <div className="hero__people">
              {['👤','👤','👤','👤','👤'].map((p, i) => (
                <span
                  key={i}
                  className="hero__person"
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Floating badges */}
          <div className="hero__float hero__float--1">✓ Verified Projects</div>
          <div className="hero__float hero__float--2">
            💰 {stats ? `~$${Math.round(stats.totalDonations / 1000000)}M+` : '$5M+'} Raised
          </div>
        </div>

      </div>
    </div>
  </section>
);
export default HeroSection;