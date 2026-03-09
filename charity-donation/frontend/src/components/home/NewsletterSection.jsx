import { useState } from 'react';
import { isValidEmail } from '../../utils/validators';
import Button from '../common/Button';
import './NewsletterSection.css';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    if (!isValidEmail(email)) { setError('Please enter a valid email address'); return; }
    setError(''); setSuccess(true); setEmail('');
  };

  return (
    <section className="newsletter">
      <div className="container">
        <div className="newsletter__inner">
          <h2 className="newsletter__title">Get the latest updates</h2>
          <p className="newsletter__sub">Subscribe to our newsletter and get all updates straight to your mailbox!</p>
          <p className="newsletter__note">We won't send it every 5 seconds! Promise :)</p>
          {success ? (
            <div className="newsletter__success">🎉 You're subscribed! Thanks for joining.</div>
          ) : (
            <div className="newsletter__form">
              <input
                className={`newsletter__input ${error ? 'newsletter__input--error' : ''}`}
                type="email" placeholder="Enter your email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <Button variant="accent" size="md" onClick={handleSubmit}>Subscribe</Button>
            </div>
          )}
          {error && <p className="newsletter__error">{error}</p>}
        </div>
      </div>
    </section>
  );
};
export default NewsletterSection;