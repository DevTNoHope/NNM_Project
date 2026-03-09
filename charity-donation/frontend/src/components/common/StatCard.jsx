import './StatCard.css';

const StatCard = ({ icon, value, label }) => (
  <div className="stat-card">
    {icon && <span className="stat-card__icon">{icon}</span>}
    <div className="stat-card__value">{value}</div>
    <div className="stat-card__label">{label}</div>
  </div>
);
export default StatCard;