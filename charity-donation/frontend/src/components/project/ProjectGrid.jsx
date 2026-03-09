import ProjectCard from '../ProjectCard';
import './ProjectGrid.css';

const ProjectGrid = ({ projects }) => (
  <div className="project-grid">
    {projects.map(p => <ProjectCard key={p.id} project={p} />)}
  </div>
);
export default ProjectGrid;