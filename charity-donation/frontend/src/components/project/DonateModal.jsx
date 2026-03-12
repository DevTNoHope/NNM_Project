import { useEffect, useState } from 'react';
import { QUICK_AMOUNTS, PAYMENT_METHODS } from '../../utils/constants';
import { validateDonateForm } from '../../utils/validators';
import { submitDonation } from '../../api/projectApi';
import Button from '../common/Button';
import './DonateModal.css';

const DonateModal = ({ project, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [form, setForm] = useState({
    amount: '',
    name: '',
    email: '',
    message: '',
    payment: 'VNPay'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const mapPaymentToDonationType = (payment) => {
    if (payment === 'Crypto') return 'CRYPTO';
    return 'BANKING';
  };

  const resetErrors = () => {
    setApiError('');
    setErrors({});
  };

  const handleSubmit = async () => {
    const errs = validateDonateForm(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    if (!project?.id) {
      setApiError('Project ID is missing');
      return;
    }

    resetErrors();
    setLoading(true);

    try {
      const donationType = mapPaymentToDonationType(form.payment);

      const payload = {
        amount: Number(form.amount),
        donationType
      };

      const response = await submitDonation(project.id, payload);
      const responseData = response?.data?.data;

      if (!response?.data?.success || !responseData) {
        throw new Error(response?.data?.message || 'Donation failed');
      }

      if (donationType === 'BANKING') {
        const vnpay = responseData.vnpay;

        if (vnpay?.paymentUrl) {
          window.location.href = vnpay.paymentUrl;
          return;
        }

        throw new Error('VNPay paymentUrl not found');
      }

      alert('Crypto donation created successfully');
      onClose();
    } catch (error) {
      setApiError(
        error?.response?.data?.message ||
          error?.message ||
          'Unable to create donation'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <button className="modal__close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="modal__header">
          <h2 className="modal__title">Donate to Project</h2>
          <p className="modal__subtitle">{project.title}</p>
        </div>

        <div className="modal__body">
          <div className="donate-field">
            <label className="donate-label">Quick Amount</label>
            <div className="quick-amounts">
              {QUICK_AMOUNTS.map((a) => (
                <button
                  type="button"
                  key={a}
                  className={`quick-btn ${Number(form.amount) === a ? 'quick-btn--active' : ''}`}
                  onClick={() => set('amount', a)}
                >
                  {a.toLocaleString('vi-VN')} VND
                </button>
              ))}
            </div>
          </div>

          <div className="donate-field">
            <label className="donate-label">Amount (VND)</label>
            <input
              className={`donate-input ${errors.amount ? 'donate-input--error' : ''}`}
              type="number"
              placeholder="Enter amount"
              value={form.amount}
              onChange={(e) => {
                set('amount', e.target.value);
                setErrors((er) => ({ ...er, amount: '' }));
              }}
            />
            {errors.amount && <span className="donate-error">{errors.amount}</span>}
          </div>

          <div className="donate-field">
            <label className="donate-label">Your Name</label>
            <input
              className={`donate-input ${errors.name ? 'donate-input--error' : ''}`}
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => {
                set('name', e.target.value);
                setErrors((er) => ({ ...er, name: '' }));
              }}
            />
            {errors.name && <span className="donate-error">{errors.name}</span>}
          </div>

          <div className="donate-field">
            <label className="donate-label">Email</label>
            <input
              className={`donate-input ${errors.email ? 'donate-input--error' : ''}`}
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={(e) => {
                set('email', e.target.value);
                setErrors((er) => ({ ...er, email: '' }));
              }}
            />
            {errors.email && <span className="donate-error">{errors.email}</span>}
          </div>

          <div className="donate-field">
            <label className="donate-label">Message (Optional)</label>
            <textarea
              className="donate-input donate-input--textarea"
              placeholder="Leave a note of support..."
              value={form.message}
              onChange={(e) => set('message', e.target.value)}
              rows={3}
            />
          </div>

          <div className="donate-field">
            <label className="donate-label">Payment Method</label>
            <div className="payment-methods">
              {PAYMENT_METHODS.map((m) => (
                <button
                  type="button"
                  key={m}
                  className={`payment-btn ${form.payment === m ? 'payment-btn--active' : ''}`}
                  onClick={() => set('payment', m)}
                >
                  <span className="payment-icon">
                    {m === 'VNPay' ? '💳' : '₿'}
                  </span>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {apiError && <span className="donate-error">{apiError}</span>}
        </div>

        <div className="modal__footer">
          <Button variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" size="md" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Redirecting...' : `Donate${form.amount ? ` ${Number(form.amount).toLocaleString('vi-VN')} VND` : ''}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DonateModal;