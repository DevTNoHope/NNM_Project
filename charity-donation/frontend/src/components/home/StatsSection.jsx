import './StatsSection.css';

const StatsSection = ({ stats }) => {
  if (!stats) return null;

  const displayStats = [
    { label: 'Projects on Platform', value: stats.projectsCount.toLocaleString() },
    { label: 'Total Donations', value: `~$${Math.abs(Math.round(stats.totalDonations)).toLocaleString()}` },
    { label: 'Global Donors', value: stats.usersCount.toLocaleString() },
  ];

  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-section__inner">
          {displayStats.map(s => (
            <div key={s.label} className="stats-item">
              <div className="stats-item__label">{s.label}</div>
              <div className="stats-item__value">{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default StatsSection;