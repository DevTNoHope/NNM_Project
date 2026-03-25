import { useState, useEffect } from 'react';
import { SORT_OPTIONS } from '../../utils/constants';
import { getCategories } from '../../api/categoryApi';
import './ProjectFilters.css';

const PROJECT_STATUSES = ['All', 'Published', 'Archived'];

const ProjectFilters = ({ filters, onChange, resultCount }) => {
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        const data = res.data?.data || res.data || [];
        setCategories(['All', ...data.map(c => c.name)]);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const set = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <div className="project-filters">
      <div className="project-filters__row">
        <div className="project-filters__group">
          <label className="project-filters__label">Status</label>
          <div className="project-filters__pills">
            {PROJECT_STATUSES.map(s => (
              <button key={s} className={`filter-pill ${filters.status === s ? 'filter-pill--active' : ''}`} onClick={() => set('status', s)}>{s}</button>
            ))}
          </div>
        </div>
        <div className="project-filters__group">
          <label className="project-filters__label">Category</label>
          <select className="project-filters__select" value={filters.category} onChange={e => set('category', e.target.value)}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="project-filters__group">
          <label className="project-filters__label">Sort By</label>
          <select className="project-filters__select" value={filters.sort} onChange={e => set('sort', e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
      <div className="project-filters__meta">
        <span className="project-filters__count">{resultCount} project{resultCount !== 1 ? 's' : ''} found</span>
        {(filters.status !== 'All' || filters.category !== 'All' || filters.search) && (
          <button className="project-filters__clear" onClick={() => onChange({ search: '', status: 'All', category: 'All', sort: 'newest' })}>
            Clear filters ✕
          </button>
        )}
      </div>
    </div>
  );
};
export default ProjectFilters;