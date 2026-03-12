import { Link } from 'react-router-dom';
import { calcProgress, formatCurrency } from '../utils/formatCurrency';
import Tag from './common/Tag';
import './ProjectCard.css';

const ProjectCard = ({ project }) => {
  const raised = Number(project?.raised ?? project?.raised_amount ?? 0);
  const goal = Number(project?.goal ?? project?.goal_amount ?? 0);
  const progress = calcProgress(raised, goal);

  const slugOrId = project?.slug || project?.id;
  const imageSrc =
    project?.banner ||
    project?.cover_image_url ||
    'https://via.placeholder.com/600x400?text=Project';

  const categoryLabel =
    project?.category?.name ||
    project?.category ||
    project?.category_name ||
    'General';

  const organization =
    project?.organization ||
    project?.founder_name ||
    'HopeFund';

  const excerpt =
    project?.excerpt ||
    project?.description ||
    'Support this project and help make a real impact.';

  const donors = Number(project?.donors ?? 0);
  const daysLeft = Number(project?.daysLeft ?? 30);
  const verified = Boolean(project?.verified ?? false);
  const featured = Boolean(project?.featured ?? false);

  return (
    <Link to={`/projects/${slugOrId}`} className="project-card">
      <div className="project-card__image">
        <img src={imageSrc} alt={project?.title || 'Project'} loading="lazy" />
        {verified && <span className="project-card__badge">✓ Verified</span>}
        {featured && (
          <span className="project-card__badge project-card__badge--feat">
            ⭐ Featured
          </span>
        )}
      </div>

      <div className="project-card__body">
        <div className="project-card__meta">
          <Tag color="primary">{categoryLabel}</Tag>
          {daysLeft <= 14 && <Tag color="warning">{daysLeft}d left</Tag>}
        </div>

        <h3 className="project-card__title">{project?.title}</h3>
        <p className="project-card__org">{organization}</p>
        <p className="project-card__excerpt">{excerpt}</p>

        <div className="project-card__progress">
          <div className="progress-bar">
            <div
              className="progress-bar__fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="project-card__amounts">
            <span className="project-card__raised">
              {formatCurrency(raised)} raised
            </span>
            <span className="project-card__pct">{progress}%</span>
          </div>
        </div>

        <div className="project-card__footer">
          <span>{donors.toLocaleString()} donors</span>
          <span>{daysLeft} days left</span>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;