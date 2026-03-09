import { Link } from 'react-router-dom';
import './Footer.css';

const COLS = [
  [{ label: 'Home', path: '/' }, { label: 'Project', path: '/projects' }, { label: 'About Us', path: '/about' }, { label: 'FAQ', path: '/faq' }, { label: 'Support', path: '/faq' }],
  [{ label: 'Join Our Community', path: '/community' }, { label: 'Documentation', path: '#' }, { label: 'Term of Use', path: '#' }, { label: 'Onboarding Guide', path: '#' }],
  [{ label: 'Partnerships', path: '#' }, { label: 'Leave Feedback', path: '#' }, { label: "We're hiring", path: '#' }],
  [{ label: 'Q/acc', path: '#' }, { label: 'Q/acc News', path: '/blog' }],
];

const SOCIALS = [
  { icon: '📷', label: 'Instagram' }, { icon: '⚡', label: 'GitHub' }, { icon: '💬', label: 'Reddit' },
  { icon: '🐦', label: 'Twitter' }, { icon: '▶️', label: 'YouTube' }, { icon: '🎮', label: 'Discord' },
];

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer__inner">
        {COLS.map((col, i) => (
          <div key={i} className="footer__col">
            <ul className="footer__links">
              {col.map(l => (
                <li key={l.label}><Link to={l.path} className="footer__link">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="footer__bottom">
        <div className="footer__social">
          {SOCIALS.map(s => (
            <a key={s.label} href="#" className="footer__social-icon" aria-label={s.label}>{s.icon}</a>
          ))}
        </div>
        <p className="footer__copy">© {new Date().getFullYear()} HopeFund. All rights reserved.</p>
      </div>
    </div>
  </footer>
);
export default Footer;