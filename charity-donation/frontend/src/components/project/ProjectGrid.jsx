import ProjectCard from '../ProjectCard';
import './ProjectGrid.css';

const ProjectGrid = ({ projects }) => {
  const safeProjects = Array.isArray(projects) ? projects : [];

  return (
    <div className="project-grid">
      {safeProjects.map((project) => (
        <ProjectCard key={project?.id || project?.slug} project={project} />
      ))}
    </div>
  );
};

export default ProjectGrid;