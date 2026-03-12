import { Link, useLocation } from 'react-router-dom';
import './PaymentResultPage.css';

const PaymentResultPage = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const projectId = params.get('projectId');
  const payment = params.get('payment');
  const success = payment === 'success';

  return (
    <div className="payment-result">
      <div className="payment-card">
        <div className="payment-icon">
          {success ? '🎉' : '❌'}
        </div>

        <h1 className="payment-title">
          {success ? 'Thank you for your donation!' : 'Payment failed'}
        </h1>

        <p className="payment-message">
          {success
            ? 'Your contribution has been received successfully.'
            : 'Your payment was cancelled or unsuccessful. Please try again.'}
        </p>

        <div className="payment-actions">
          <Link to={projectId ? `/projects/${projectId}` : '/projects'} className="btn-primary">
            Back to Project
          </Link>

          <Link to="/" className="btn-secondary">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;