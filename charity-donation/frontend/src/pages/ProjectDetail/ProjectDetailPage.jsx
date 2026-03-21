import { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getProjects, getProjectById, getProjectUpdates } from '../../api/projectApi';
import { calcProgress, formatCurrency } from '../../utils/formatCurrency';
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
  const location = useLocation();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Overview');
  const [showDonate, setShowDonate] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const payment = params.get('payment');

    if (payment === 'success') {
      setPaymentStatus('success');
      return;
    }

    if (payment === 'failed') {
      setPaymentStatus('failed');
      return;
    }

    setPaymentStatus(null);
  }, [location.search]);

  useEffect(() => {
    const loadProjectDetail = async () => {
      try {
        setLoading(true);

        const [p, all, updatesRes] = await Promise.all([
          getProjectById(slug),
          getProjects(),
          getProjectUpdates(slug).catch(() => ({ data: { data: [] } }))
        ]);

        const currentProject = p?.data?.data || null;
        const allProjects = all?.data?.data || [];
        const fetchedUpdates = updatesRes?.data?.data || [];

        if (currentProject) {
          currentProject.updates = fetchedUpdates;
        }

        setProject(currentProject);
        setRelated(
          Array.isArray(allProjects)
            ? allProjects.filter((x) => String(x.id) !== String(slug)).slice(0, 3)
            : []
        );
      } catch (error) {
        console.error('Load project detail failed:', error);
        setProject(null);
        setRelated([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjectDetail();
  }, [slug]);

  const closePaymentBanner = () => {
    setPaymentStatus(null);
    navigate(`/projects/${slug}`, { replace: true });
  };

  const mappedProject = useMemo(() => {
    if (!project) return null;

    const raised = Number(project?.raised ?? project?.raised_amount ?? 0);
    const goal = Number(project?.goal ?? project?.goal_amount ?? 0);
    const donors = Number(project?.donors ?? 0);
    const daysLeft = Number(project?.daysLeft ?? 30);

    return {
      ...project,
      banner:
        project?.banner ||
        project?.cover_image_url ||
        'https://via.placeholder.com/1200x500?text=Project',
      raised,
      goal,
      donors,
      daysLeft,
      category:
        project?.category?.name ||
        project?.category ||
        project?.category_name ||
        'General',
      organization:
        project?.organization ||
        project?.founder_name ||
        'HopeFund',
      tags: Array.isArray(project?.tags) ? project.tags : [],
      updates: Array.isArray(project?.updates) ? project.updates : [],
      verified: Boolean(project?.verified ?? false),
      featured: Boolean(project?.featured ?? false),
      active: String(project?.status || '').toUpperCase() === 'APPROVED'
    };
  }, [project]);

  if (loading) return <Spinner center size="lg" />;

  if (!mappedProject) {
    return (
      <EmptyState
        title="Project not found"
        action="Browse Projects"
        actionPath="/projects"
      />
    );
  }

  const progress = calcProgress(mappedProject.raised, mappedProject.goal);

  return (
    <div className="project-detail">
      {paymentStatus && (
        <div
          className={`payment-banner ${paymentStatus === 'success'
            ? 'payment-banner--success'
            : 'payment-banner--failed'
            }`}
        >
          <div className="payment-banner__content">
            <span className="payment-banner__icon">
              {paymentStatus === 'success' ? '🎉' : '❌'}
            </span>
            <div>
              <strong>
                {paymentStatus === 'success'
                  ? 'Thank you for your donation!'
                  : 'Payment failed.'}
              </strong>
              <p>
                {paymentStatus === 'success'
                  ? 'Your contribution has been received successfully.'
                  : 'Your payment was cancelled or unsuccessful. Please try again.'}
              </p>
            </div>
          </div>

          <button
            className="payment-banner__close"
            type="button"
            onClick={closePaymentBanner}
            aria-label="Close payment message"
          >
            ×
          </button>
        </div>
      )}

      <div className="project-detail__banner">
        <img 
          src={mappedProject.banner} 
          alt={mappedProject.title} 
          className="clickable-img"
          onClick={() => setLightboxImg(mappedProject.banner)}
        />
        <div className="project-detail__banner-overlay" />
      </div>

      <div className="container">
        <div className="project-detail__layout">
          <main className="project-detail__main">
            <div className="project-detail__tags">
              <Tag color="primary">{mappedProject.category}</Tag>
              {mappedProject.verified && <Tag color="success">✓ Verified</Tag>}
              {mappedProject.featured && <Tag color="warning">⭐ Featured</Tag>}
              {mappedProject.active && <Tag color="primary">🟢 Active</Tag>}
            </div>

            <h1 className="project-detail__title">{mappedProject.title}</h1>
            <p className="project-detail__org">
              By <strong>{mappedProject.organization}</strong>
            </p>

            <div className="project-detail__tabs">
              {TABS.map((t) => (
                <button
                  key={t}
                  className={`detail-tab ${tab === t ? 'detail-tab--active' : ''}`}
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="project-detail__content">
              {tab === 'Overview' && (
                <div className="project-detail__desc">
                  <div dangerouslySetInnerHTML={{ __html: mappedProject.description || "No description provided." }} />

                  {mappedProject.tags.length > 0 && (
                    <div className="project-detail__tag-list">
                      {mappedProject.tags.map((t) => (
                        <Tag key={t} color="default">
                          {t}
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === 'Updates' && (
                <div className="project-detail__updates">
                  {mappedProject.updates.length === 0 ? (
                    <EmptyState
                      title="No updates yet"
                      description="Check back soon for project updates."
                    />
                  ) : (
                    mappedProject.updates.map((u, i) => {
                      const d = new Date(u.created_at || u.date || Date.now());
                      const day = d.getDate();
                      const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
                      const month = monthNames[d.getMonth()];
                      const year = d.getFullYear();

                      return (
                        <div key={i} className="update-timeline-item">
                          <div className="update-timeline-date">
                            <span className="utd-day">{day}</span>
                            <span className="utd-month">{month}</span>
                            <span className="utd-year">{year}</span>
                            <div className="utd-line" />
                          </div>
                          <div className="update-timeline-content">
                            <h4 className="utc-title">{u.title}</h4>
                            {u.image_url && (
                              <img
                                src={u.image_url}
                                alt="Update attachment"
                                className="clickable-img"
                                onClick={() => setLightboxImg(u.image_url)}
                                style={{ maxWidth: '35%', borderRadius: '8px', marginBottom: '16px' }}
                              />
                            )}
                            <div className="utc-body" dangerouslySetInnerHTML={{ __html: u.content }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {tab === 'Donors' && (
                <EmptyState
                  title="Donor list coming soon"
                  description="Donor transparency feature is in development."
                />
              )}
            </div>
          </main>

          <aside className="project-detail__sidebar">
            <div className="donate-card">
              <div className="donate-card__raised">
                <span className="donate-card__amount">
                  {formatCurrency(mappedProject.raised)}
                </span>
                <span className="donate-card__goal">
                  {' '}
                  raised of {formatCurrency(mappedProject.goal)}
                </span>
              </div>

              <div className="progress-bar" style={{ margin: '12px 0' }}>
                <div
                  className="progress-bar__fill"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="donate-card__stats">
                <div className="donate-card__stat">
                  <span className="donate-card__stat-val">{progress}%</span>
                  <span className="donate-card__stat-lbl">Funded</span>
                </div>

                <div className="donate-card__stat">
                  <span className="donate-card__stat-val">
                    {mappedProject.donors.toLocaleString()}
                  </span>
                  <span className="donate-card__stat-lbl">Donors</span>
                </div>

                <div className="donate-card__stat">
                  <span className="donate-card__stat-val">
                    {mappedProject.daysLeft}
                  </span>
                  <span className="donate-card__stat-lbl">Days Left</span>
                </div>
              </div>

              <Button
                variant="accent"
                size="lg"
                className="donate-card__btn"
                onClick={() => setShowDonate(true)}
              >
                💚 Donate Now
              </Button>

              <p className="donate-card__note">
                Secure · Transparent · Verified
              </p>
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

      {showDonate && (
        <DonateModal project={mappedProject} onClose={() => setShowDonate(false)} />
      )}

      {lightboxImg && (
        <div className="image-lightbox" onClick={() => setLightboxImg(null)}>
          <button className="image-lightbox__close" onClick={(e) => { e.stopPropagation(); setLightboxImg(null); }}>
            &times;
          </button>
          <img src={lightboxImg} alt="Enlarged view" className="image-lightbox__img" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;