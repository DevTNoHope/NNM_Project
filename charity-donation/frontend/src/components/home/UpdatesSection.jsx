import { MOCK_UPDATES } from '../../utils/mockData';
import './UpdatesSection.css';

const UpdatesSection = () => (
  <section className="updates-section">
    <div className="container">
      <h3 className="updates-section__title">Last Updates</h3>
      <div className="updates-section__grid">
        {MOCK_UPDATES.map(u => (
          <div key={u.id} className="update-item">
            <div className="update-item__image">
              <img src={u.image} alt={u.title} loading="lazy" />
            </div>
            <div className="update-item__body">
              <p className="update-item__date">{u.date}</p>
              <p className="update-item__title">{u.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
export default UpdatesSection;