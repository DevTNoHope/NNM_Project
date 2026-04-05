import { Link } from 'react-router-dom';
import Button from '@/components/common/Button';
import './NotFoundPage.css';

const NotFoundPage = () => (
  <div className="notfound">
    <div className="notfound__inner">
      <div className="notfound__code">404</div>
      <h1 className="notfound__title">Page Not Found</h1>
      <p className="notfound__desc">The page you're looking for doesn't exist, or may have been moved. Let's get you back on track.</p>
      <div className="notfound__actions">
        <Button as={Link} to="/" variant="accent" size="lg">← Back to Home</Button>
        <Button as={Link} to="/projects" variant="outline" size="lg">Browse Projects</Button>
      </div>
    </div>
  </div>
);
export default NotFoundPage;