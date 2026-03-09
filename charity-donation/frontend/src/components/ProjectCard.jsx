import { Link } from 'react-router-dom';
import { calcProgress, formatCurrency } from '../utils/formatCurrency';
import Tag from './common/Tag';
import './ProjectCard.css';

const ProjectCard = ({ project }) => {
  const progress = calcProgress(project.raised, project.goal);
  return (
    <Link to={`/projects/${project.slug}`} className="project-card">
      <div className="project-card__image">
        <img src={project.banner} alt={project.title} loading="lazy" />
        {project.verified && <span className="project-card__badge">✓ Verified</span>}
        {project.featured && <span className="project-card__badge project-card__badge--feat">⭐ Featured</span>}
      </div>
      <div className="project-card__body">
        <div className="project-card__meta">
          <Tag color="primary">{project.category}</Tag>
          {project.daysLeft <= 14 && <Tag color="warning">{project.daysLeft}d left</Tag>}
        </div>
        <h3 className="project-card__title">{project.title}</h3>
        <p className="project-card__org">{project.organization}</p>
        <p className="project-card__excerpt">{project.excerpt}</p>
        <div className="project-card__progress">
          <div className="progress-bar">
            <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="project-card__amounts">
            <span className="project-card__raised">{formatCurrency(project.raised)} raised</span>
            <span className="project-card__pct">{progress}%</span>
          </div>
        </div>
        <div className="project-card__footer">
          <span>{project.donors.toLocaleString()} donors</span>
          <span>{project.daysLeft} days left</span>
        </div>
      </div>
    </Link>
  );
};
export default ProjectCard;