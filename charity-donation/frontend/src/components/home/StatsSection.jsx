import { MOCK_STATS } from '../../utils/mockData';
import './StatsSection.css';

const StatsSection = () => (
  <section className="stats-section">
    <div className="container">
      <div className="stats-section__inner">
        {MOCK_STATS.map(s => (
          <div key={s.label} className="stats-item">
            <div className="stats-item__label">{s.label}</div>
            <div className="stats-item__value">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
export default StatsSection;