import './EmptyState.css';
import Button from './Button';
import { Link } from 'react-router-dom';

const EmptyState = ({ title = 'Nothing here yet', description, action, actionPath }) => (
  <div className="empty-state">
    <div className="empty-state__icon">🔍</div>
    <h3 className="empty-state__title">{title}</h3>
    {description && <p className="empty-state__desc">{description}</p>}
    {action && actionPath && (
      <Button as={Link} to={actionPath} variant="primary" size="md">{action}</Button>
    )}
  </div>
);
export default EmptyState;