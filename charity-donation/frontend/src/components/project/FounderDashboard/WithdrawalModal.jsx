import React, { useState, useEffect } from 'react';
import withdrawApi from '@/api/withdraw.api';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import './WithdrawalModal.css';

const WithdrawalModal = ({ project, onClose, onSuccess }) => {
  const [type, setType] = useState('CRYPTO');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    accountNumber: '',
    accountName: ''
  });
  
  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchBalance = async () => {
      setLoadingBalance(true);
      try {
        const res = await withdrawApi.getBalance(project.id, type);
        setBalance(res.data?.data?.balance || 0);
      } catch (err) {
        console.error("Failed to fetch balance", err);
      } finally {
        setLoadingBalance(false);
      }
    };
    fetchBalance();
  }, [project.id, type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (Number(amount) > balance) {
      setError("Insufficient balance");
      return;
    }

    if (type === 'BANKING') {
      if (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountName) {
        setError("Please fill in all banking details");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        projectId: project.id,
        amount: Number(amount),
        note,
        type,
        ...bankInfo
      };
      
      const res = await withdrawApi.createRequest(payload);
      setSuccessMsg(res.data?.data?.message || "Request created. Please check your email for confirmation.");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (successMsg) {
    return (
      <div className="modal-overlay">
        <div className="modal-content success-content">
          <div className="success-icon">Check</div>
          <h2>Success!</h2>
          <p>{successMsg}</p>
          <Button variant="primary" onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content withdrawal-modal">
        <div className="modal-header">
          <h2>Withdraw Funds</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Withdrawal Method</label>
            <div className="type-toggle">
              <button 
                type="button" 
                className={type === 'CRYPTO' ? 'active' : ''} 
                onClick={() => setType('CRYPTO')}
              >
                Crypto (Vault)
              </button>
              <button 
                type="button" 
                className={type === 'BANKING' ? 'active' : ''} 
                onClick={() => setType('BANKING')}
              >
                Bank Transfer (VNPay)
              </button>
            </div>
          </div>

          <div className="balance-info">
            <span>Available Balance:</span>
            <strong>
              {loadingBalance ? <Spinner size="sm" inline /> : `$${balance.toLocaleString()}`}
            </strong>
          </div>

          <div className="form-group">
            <label>Amount to Withdraw ($)</label>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              placeholder="Enter amount..."
              required
            />
          </div>

          {type === 'BANKING' && (
            <div className="banking-fields">
              <div className="form-group">
                <label>Bank Name</label>
                <input 
                  type="text" 
                  value={bankInfo.bankName} 
                  onChange={(e) => setBankInfo({...bankInfo, bankName: e.target.value})} 
                  placeholder="e.g. Vietcombank"
                  required
                />
              </div>
              <div className="form-group">
                <label>Account Number</label>
                <input 
                  type="text" 
                  value={bankInfo.accountNumber} 
                  onChange={(e) => setBankInfo({...bankInfo, accountNumber: e.target.value})} 
                  placeholder="Enter account number..."
                  required
                />
              </div>
              <div className="form-group">
                <label>Account Name</label>
                <input 
                  type="text" 
                  value={bankInfo.accountName} 
                  onChange={(e) => setBankInfo({...bankInfo, accountName: e.target.value})} 
                  placeholder="Cardholder name..."
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea 
              value={note} 
              onChange={(e) => setNote(e.target.value)} 
              placeholder="Reason for withdrawal or additional info..."
            />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <div className="modal-footer">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Processing..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithdrawalModal;
