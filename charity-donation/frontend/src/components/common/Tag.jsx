import './Tag.css';

const Tag = ({ children, color = 'default', className = '' }) => (
  <span className={`tag tag--${color} ${className}`}>{children}</span>
);
export default Tag;