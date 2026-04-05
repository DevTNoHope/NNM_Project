import './AboutPage.css';

const VALUES = [
  { icon: '🔍', title: 'Transparency', desc: 'Every donation tracked on-chain. No hidden fees, no black boxes.' },
  { icon: '🤝', title: 'Community', desc: 'Decisions made by and for our community of givers and builders.' },
  { icon: '⚡', title: 'Impact', desc: 'We measure success by real-world outcomes, not just amounts raised.' },
  { icon: '🌍', title: 'Inclusion', desc: 'Accessible to anyone, anywhere, regardless of banking status.' },
];

const MILESTONES = [
  { year: '2021', event: 'HopeFund founded with a vision of transparent giving' },
  { year: '2022', event: 'First 100 verified projects onboarded' },
  { year: '2023', event: '$5M raised for impact projects worldwide' },
  { year: '2024', event: 'Launched Quadratic Funding rounds' },
];

const TEAM = [
  { name: 'Sarah Chen', role: 'Co-Founder & CEO', emoji: '👩' },
  { name: 'Marcus Johnson', role: 'CTO', emoji: '👨' },
  { name: 'Aisha Patel', role: 'Head of Community', emoji: '👩' },
  { name: 'David Kim', role: 'Head of Partnerships', emoji: '👨' },
];

const AboutPage = () => (
  <div className="about-page">
    <section className="about-hero">
      <div className="container">
        <h1 className="about-hero__title">Our Mission</h1>
        <p className="about-hero__sub">Transforming charitable giving through transparency, technology, and community.</p>
      </div>
    </section>

    <section className="about-intro container">
      <div className="about-intro__inner">
        <div>
          <h2>What We Believe</h2>
          <p>We believe every person on earth deserves the opportunity to contribute to causes they care about — regardless of how much they have, or where they live.</p>
          <p>By combining blockchain transparency with community governance, we ensure every dollar donated creates maximum impact.</p>
        </div>
        <div className="about-vision-card">
          <h3>Our Vision</h3>
          <p>A world where generosity is the default, and every act of giving is amplified by technology and community.</p>
        </div>
      </div>
    </section>

    <section className="about-values">
      <div className="container">
        <h2 className="about-section-title">Our Values</h2>
        <div className="about-values__grid">
          {VALUES.map(v => (
            <div key={v.title} className="value-card">
              <div className="value-card__icon">{v.icon}</div>
              <h3 className="value-card__title">{v.title}</h3>
              <p className="value-card__desc">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="about-timeline">
      <div className="container">
        <h2 className="about-section-title">Our Journey</h2>
        <div className="timeline">
          {MILESTONES.map((m, i) => (
            <div key={i} className="timeline__item">
              <div className="timeline__year">{m.year}</div>
              <div className="timeline__dot" />
              <div className="timeline__event">{m.event}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="about-team">
      <div className="container">
        <h2 className="about-section-title">Meet the Team</h2>
        <div className="team-grid">
          {TEAM.map(m => (
            <div key={m.name} className="team-card">
              <div className="team-card__avatar">{m.emoji}</div>
              <h4 className="team-card__name">{m.name}</h4>
              <p className="team-card__role">{m.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);
export default AboutPage;