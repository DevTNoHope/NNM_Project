import './SearchBar.css';

const SearchBar = ({ value, onChange, placeholder = 'Search...', className = '' }) => (
  <div className={`search-bar ${className}`}>
    <span className="search-bar__icon">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    </span>
    <input
      type="text"
      className="search-bar__input"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
    {value && (
      <button className="search-bar__clear" onClick={() => onChange('')} aria-label="Clear">✕</button>
    )}
  </div>
);
export default SearchBar;