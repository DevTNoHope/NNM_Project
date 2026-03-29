import { MOCK_PARTNERS } from '@/utils/mockData';
import './PartnersSection.css';

const PartnersSection = () => (
  <section className="partners-section">
    <div className="container">
      <h3 className="partners-section__title">Proud of our partners</h3>
      <div className="partners-section__logos">
        {MOCK_PARTNERS.map(p => (
          <div key={p.id} className="partner-logo">
            <span className="partner-logo__icon">{p.logo}</span>
            <span className="partner-logo__name">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);
export default PartnersSection;