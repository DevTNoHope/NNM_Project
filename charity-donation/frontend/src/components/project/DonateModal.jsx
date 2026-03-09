import { useState, useEffect } from 'react';
import { QUICK_AMOUNTS, PAYMENT_METHODS } from '../../utils/constants';
import { validateDonateForm } from '../../utils/validators';
import { submitDonation } from '../../api/projectApi';
import Button from '../common/Button';
import './DonateModal.css';

const DonateModal = ({ project, onClose }) => {
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ amount: '', name: '', email: '', message: '', payment: 'Card' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    const errs = validateDonateForm(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await submitDonation({ ...form, projectId: project.id });
    setLoading(false);
    setStep('success');
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>

        {step === 'form' ? (
          <>
            <div className="modal__header">
              <h2 className="modal__title">Donate to Project</h2>
              <p className="modal__subtitle">{project.title}</p>
            </div>

            <div className="modal__body">
              <div className="donate-field">
                <label className="donate-label">Quick Amount</label>
                <div className="quick-amounts">
                  {QUICK_AMOUNTS.map(a => (
                    <button key={a} className={`quick-btn ${Number(form.amount) === a ? 'quick-btn--active' : ''}`} onClick={() => set('amount', a)}>
                      ${a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="donate-field">
                <label className="donate-label">Custom Amount (USD)</label>
                <input
                  className={`donate-input ${errors.amount ? 'donate-input--error' : ''}`}
                  type="number" placeholder="Enter amount" value={form.amount}
                  onChange={e => { set('amount', e.target.value); setErrors(er => ({ ...er, amount: '' })); }}
                />
                {errors.amount && <span className="donate-error">{errors.amount}</span>}
              </div>

              <div className="donate-field">
                <label className="donate-label">Your Name</label>
                <input
                  className={`donate-input ${errors.name ? 'donate-input--error' : ''}`}
                  type="text" placeholder="Full name" value={form.name}
                  onChange={e => { set('name', e.target.value); setErrors(er => ({ ...er, name: '' })); }}
                />
                {errors.name && <span className="donate-error">{errors.name}</span>}
              </div>

              <div className="donate-field">
                <label className="donate-label">Email</label>
                <input
                  className={`donate-input ${errors.email ? 'donate-input--error' : ''}`}
                  type="email" placeholder="you@email.com" value={form.email}
                  onChange={e => { set('email', e.target.value); setErrors(er => ({ ...er, email: '' })); }}
                />
                {errors.email && <span className="donate-error">{errors.email}</span>}
              </div>

              <div className="donate-field">
                <label className="donate-label">Message (Optional)</label>
                <textarea
                  className="donate-input donate-input--textarea"
                  placeholder="Leave a note of support..." value={form.message}
                  onChange={e => set('message', e.target.value)} rows={3}
                />
              </div>

              <div className="donate-field">
                <label className="donate-label">Payment Method</label>
                <div className="payment-methods">
                  {PAYMENT_METHODS.map(m => (
                    <button key={m} className={`payment-btn ${form.payment === m ? 'payment-btn--active' : ''}`} onClick={() => set('payment', m)}>
                      <span>{m === 'Crypto' ? '₿' : m === 'Card' ? '💳' : '🏦'}</span> {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal__footer">
              <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
              <Button variant="accent" size="md" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Processing...' : `Donate${form.amount ? ` $${form.amount}` : ''}`}
              </Button>
            </div>
          </>
        ) : (
          <div className="donate-success">
            <div className="donate-success__icon">🎉</div>
            <h2>Thank You, {form.name.split(' ')[0]}!</h2>
            <p>Your donation of <strong>${form.amount}</strong> to <strong>{project.title}</strong> has been received.</p>
            <p className="donate-success__sub">A confirmation will be sent to {form.email}</p>
            <Button variant="primary" size="lg" onClick={onClose}>Close</Button>
          </div>
        )}
      </div>
    </div>
  );
};
export default DonateModal;