import { Link } from "react-router-dom";
import { calcProgress, formatCurrency } from "@/utils/formatCurrency";
import Tag from "./common/Tag";
import "./ProjectCard.css";

const ProjectCard = ({ project }) => {
  const raised = Number(
    project?.raised ?? project?.raised_amount ?? project?.total_donated ?? project?.total_raised ?? 0,
  );

  const goal = Number(project?.goal ?? project?.goal_amount ?? 0);
  const progress = calcProgress(raised, goal);

  const slugOrId = project?.slug || project?.id;

  const imageSrc =
    project?.banner ||
    project?.cover_image_url ||
    "https://via.placeholder.com/600x400?text=Project";

  const categoryLabel =
    project?.category?.name ||
    project?.category ||
    project?.category_name ||
    "General";

  const founder = project?.organization || project?.founder_name || "Unknown";

  const rawExcerpt =
    project?.excerpt ||
    project?.description ||
    'Support this project and help make a real impact.';
  const excerpt = rawExcerpt.replace(/<[^>]*>?/gm, '');

  const daysLeft = Number(project?.daysLeft ?? 30);
  const donors = Number(project?.donors ?? project?.total_donors ?? 0);
  const verified = Boolean(project?.verified ?? false);

  return (
    <Link to={`/projects/${slugOrId}`} className="project-card">
      <div className="project-card__image">
        <img
          src={imageSrc}
          alt={project?.title || "Project"}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              "https://via.placeholder.com/600x400?text=Project";
          }}
        />
        {verified && <span className="project-card__badge">✓ Verified</span>}
      </div>

      <div className="project-card__body">
        <div className="project-card__meta">
          <Tag color="primary">{categoryLabel}</Tag>
        </div>

        <h3 className="project-card__title">{project?.title}</h3>

        <p className="project-card__org">
          {project?.founder_id ? (
            <Link to={`/profile/${project.founder_id}`} className="founder-link">
              <strong>{founder}</strong>
            </Link>
          ) : (
            <strong>{founder}</strong>
          )}
        </p>

        <div className="project-card__progress">
          <div className="progress-bar">
            <div
              className="progress-bar__fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="project-card__amounts">
            <span className="project-card__raised">
              {formatCurrency(raised)}
            </span>
            <span className="project-card__goal">/ {formatCurrency(goal)}</span>
          </div>
        </div>

        <div className="project-card__footer">
          <span>{donors.toLocaleString()} donors</span>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
