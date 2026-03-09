import { Link } from 'react-router-dom';
import './FeatureCard.css';

const FeatureCard = ({ icon, title, description, link, linkLabel }) => (
  <div className="feature-card">
    <div className="feature-card__icon">{icon}</div>
    <h3 className="feature-card__title">{title}</h3>
    <p className="feature-card__desc">{description}</p>
    {link && <Link to={link} className="feature-card__link">{linkLabel || 'Learn More'} →</Link>}
  </div>
);
export default FeatureCard;