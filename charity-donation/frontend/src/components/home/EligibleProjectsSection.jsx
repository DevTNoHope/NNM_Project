import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedProjects } from '../../api/projectApi';
import ProjectGrid from '../project/ProjectGrid';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import './EligibleProjectsSection.css';

const EligibleProjectsSection = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedProjects().then(r => { setProjects(r.data); setLoading(false); });
  }, []);

  return (
    <section className="eligible-section">
      <div className="container">
        <div className="eligible-section__inner">
          <div className="eligible-section__left">
            <span className="eligible-section__eye">Latest</span>
            <h2 className="eligible-section__title">Newly<br />Eligible</h2>
            <p className="eligible-section__desc">Discover the latest verified projects ready to receive your support.</p>
            <Button as={Link} to="/projects" variant="primary" size="md">Explore →</Button>
          </div>
          <div className="eligible-section__right">
            {loading ? <Spinner center /> : <ProjectGrid projects={projects} />}
          </div>
        </div>
      </div>
    </section>
  );
};
export default EligibleProjectsSection;