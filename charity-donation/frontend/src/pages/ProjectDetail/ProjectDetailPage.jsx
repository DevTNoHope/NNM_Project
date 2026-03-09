import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectBySlug, getProjects } from '../../api/projectApi';
import { calcProgress, formatCurrency, formatDate } from '../../utils/formatCurrency';
import DonateModal from '../../components/project/DonateModal';
import ProjectGrid from '../../components/project/ProjectGrid';
import Tag from '../../components/common/Tag';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import './ProjectDetailPage.css';

const TABS = ['Overview', 'Updates', 'Donors'];

const ProjectDetailPage = () => {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Overview');
  const [showDonate, setShowDonate] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getProjectBySlug(slug), getProjects()]).then(([p, all]) => {
      setProject(p.data);
      setRelated(all.data.filter(x => x.slug !== slug).slice(0, 3));
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <Spinner center size="lg" />;
  if (!project) return <EmptyState title="Project not found" action="Browse Projects" actionPath="/projects" />;

  const progress = calcProgress(project.raised, project.goal);

  return (
    <div className="project-detail">
      <div className="project-detail__banner">
        <img src={project.banner} alt={project.title} />
        <div className="project-detail__banner-overlay" />
      </div>

      <div className="container">
        <div className="project-detail__layout">
          <main className="project-detail__main">
            <div className="project-detail__tags">
              <Tag color="primary">{project.category}</Tag>
              {project.verified && <Tag color="success">✓ Verified</Tag>}
              {project.featured && <Tag color="warning">⭐ Featured</Tag>}
              {project.active && <Tag color="primary">🟢 Active</Tag>}
            </div>
            <h1 className="project-detail__title">{project.title}</h1>
            <p className="project-detail__org">By <strong>{project.organization}</strong></p>

            <div className="project-detail__tabs">
              {TABS.map(t => (
                <button key={t} className={`detail-tab ${tab === t ? 'detail-tab--active' : ''}`} onClick={() => setTab(t)}>{t}</button>
              ))}
            </div>

            <div className="project-detail__content">
              {tab === 'Overview' && (
                <div className="project-detail__desc">
                  {project.description.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                  <div className="project-detail__tag-list">
                    {project.tags.map(t => <Tag key={t} color="default">{t}</Tag>)}
                  </div>
                </div>
              )}
              {tab === 'Updates' && (
                <div className="project-detail__updates">
                  {project.updates.length === 0 ? (
                    <EmptyState title="No updates yet" description="Check back soon for project updates." />
                  ) : project.updates.map((u, i) => (
                    <div key={i} className="update-card">
                      <div className="update-card__date">{formatDate(u.date)}</div>
                      <h4 className="update-card__title">{u.title}</h4>
                      <p className="update-card__content">{u.content}</p>
                    </div>
                  ))}
                </div>
              )}
              {tab === 'Donors' && (
                <EmptyState title="Donor list coming soon" description="Donor transparency feature is in development." />
              )}
            </div>
          </main>

          <aside className="project-detail__sidebar">
            <div className="donate-card">
              <div className="donate-card__raised">
                <span className="donate-card__amount">{formatCurrency(project.raised)}</span>
                <span className="donate-card__goal"> raised of {formatCurrency(project.goal)}</span>
              </div>
              <div className="progress-bar" style={{ margin: '12px 0' }}>
                <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="donate-card__stats">
                <div className="donate-card__stat">
                  <span className="donate-card__stat-val">{progress}%</span>
                  <span className="donate-card__stat-lbl">Funded</span>
                </div>
                <div className="donate-card__stat">
                  <span className="donate-card__stat-val">{project.donors.toLocaleString()}</span>
                  <span className="donate-card__stat-lbl">Donors</span>
                </div>
                <div className="donate-card__stat">
                  <span className="donate-card__stat-val">{project.daysLeft}</span>
                  <span className="donate-card__stat-lbl">Days Left</span>
                </div>
              </div>
              <Button variant="accent" size="lg" className="donate-card__btn" onClick={() => setShowDonate(true)}>
                💚 Donate Now
              </Button>
              <p className="donate-card__note">Secure · Transparent · Verified</p>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="project-detail__related">
            <h2 className="project-detail__related-title">Related Projects</h2>
            <ProjectGrid projects={related} />
          </section>
        )}
      </div>

      {showDonate && <DonateModal project={project} onClose={() => setShowDonate(false)} />}
    </div>
  );
};
export default ProjectDetailPage;