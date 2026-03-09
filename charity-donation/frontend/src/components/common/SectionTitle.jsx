import './SectionTitle.css';

const SectionTitle = ({ label, title, subtitle, align = 'left', className = '' }) => (
  <div className={`section-title section-title--${align} ${className}`}>
    {label && <span className="section-title__label">{label}</span>}
    <h2 className="section-title__heading">{title}</h2>
    {subtitle && <p className="section-title__sub">{subtitle}</p>}
  </div>
);
export default SectionTitle;