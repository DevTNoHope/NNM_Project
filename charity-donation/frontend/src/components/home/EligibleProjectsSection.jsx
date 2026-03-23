import { Link } from 'react-router-dom';
import ProjectGrid from '../project/ProjectGrid';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import './EligibleProjectsSection.css';

const EligibleProjectsSection = ({ projects, loading, pagination, onPageChange }) => {
  const { currentPage, totalPages } = pagination || { currentPage: 0, totalPages: 0 };

  const handlePrev = () => {
    if (currentPage > 0) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) onPageChange(currentPage + 1);
  };

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
            {loading ? (
              <Spinner center />
            ) : (
              <>
                <ProjectGrid projects={projects} />
                {totalPages > 1 && (
                  <div className="eligible-pagination">
                    <button 
                      onClick={handlePrev} 
                      disabled={currentPage === 0}
                      className="pagination-arrow"
                    >
                      ←
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => onPageChange(i)}
                        className={`pagination-num ${currentPage === i ? 'active' : ''}`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button 
                      onClick={handleNext} 
                      disabled={currentPage === totalPages - 1}
                      className="pagination-arrow"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
export default EligibleProjectsSection;