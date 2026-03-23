import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { claimFromVault } from '../../../hook/contract/donate';
import withdrawApi from '../../../api/withdraw.api';
import Spinner from '../../../components/common/Spinner';
import './ClaimWithdrawal.css';

export default function ClaimWithdrawal() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [status, setStatus] = useState('ready'); // ready, connecting, claiming, success, error
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  // Get claim data from URL params
  const requestId = searchParams.get('requestId');
  const vault = searchParams.get('vault');
  const amount = searchParams.get('amount');
  const nonce = searchParams.get('nonce');
  const deadline = searchParams.get('deadline');
  const signature = searchParams.get('signature');

  const isExpired = deadline && (Number(deadline) * 1000) < Date.now();
  const amountInTokens = amount ? (Number(BigInt(amount)) / 1e18).toFixed(2) : '0';

  const handleClaim = async () => {
    if (!user) {
      setError('Please log in first.');
      return;
    }

    if (!user.linked_wallet) {
      setError('No linked wallet found. Please link your wallet first.');
      return;
    }

    if (isExpired) {
      setError('This claim link has expired. Please contact Admin for a new approval.');
      return;
    }

    setStatus('connecting');
    setError('');

    try {
      // Step 1: Call claim on the contract (Founder signs with their wallet)
      setStatus('claiming');
      const hash = await claimFromVault({
        vaultAddress: vault,
        amount,
        nonce,
        deadline,
        signature,
        account: user.linked_wallet
      });

      setTxHash(hash);

      // Step 2: Submit tx_hash to backend
      await withdrawApi.submitClaim({
        requestId: Number(requestId),
        txHash: hash
      });

      setStatus('success');
    } catch (err) {
      console.error('Claim failed:', err);
      setError(err.message || 'Claim transaction failed');
      setStatus('error');
    }
  };

  if (!requestId || !vault || !amount || !signature) {
    return (
      <div className="claim-page">
        <div className="claim-card">
          <div className="claim-icon error">❌</div>
          <h2>Invalid Claim Link</h2>
          <p>This claim link is missing required parameters. Please check the link from your email.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="claim-page">
      <div className="claim-card">
        {status === 'success' ? (
          <>
            <div className="claim-icon success">✅</div>
            <h2>Claim Successful!</h2>
            <p className="success-text">Your funds have been transferred to your wallet.</p>
            <div className="claim-detail-box">
              <div className="claim-detail-row">
                <span>Transaction Hash</span>
                <a 
                  href={`https://testnet.bscscan.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tx-link"
                >
                  {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </a>
              </div>
            </div>
            <a 
              href={`https://testnet.bscscan.com/tx/${txHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="claim-btn success-btn"
            >
              View on BSC Explorer
            </a>
          </>
        ) : (
          <>
            <div className="claim-icon">💰</div>
            <h2>Claim Your Withdrawal</h2>
            <p className="claim-subtitle">Connect your wallet and sign the transaction to receive your funds.</p>
            
            <div className="claim-detail-box">
              <div className="claim-detail-row">
                <span>Amount</span>
                <strong>${amountInTokens}</strong>
              </div>
              <div className="claim-detail-row">
                <span>Vault</span>
                <span className="mono">{vault.slice(0, 6)}...{vault.slice(-4)}</span>
              </div>
              <div className="claim-detail-row">
                <span>Nonce</span>
                <span>{nonce}</span>
              </div>
              <div className="claim-detail-row">
                <span>Expires</span>
                <span className={isExpired ? 'expired' : ''}>
                  {deadline ? new Date(Number(deadline) * 1000).toLocaleString() : 'N/A'}
                </span>
              </div>
              {user?.linked_wallet && (
                <div className="claim-detail-row">
                  <span>Your Wallet</span>
                  <span className="mono">{user.linked_wallet.slice(0, 6)}...{user.linked_wallet.slice(-4)}</span>
                </div>
              )}
            </div>

            {isExpired ? (
              <div className="claim-error">This claim link has expired. Please contact Admin.</div>
            ) : (
              <button 
                className="claim-btn"
                onClick={handleClaim}
                disabled={status === 'connecting' || status === 'claiming'}
              >
                {status === 'connecting' && <><Spinner size="sm" /> Connecting Wallet...</>}
                {status === 'claiming' && <><Spinner size="sm" /> Claiming... (Check MetaMask)</>}
                {(status === 'ready' || status === 'error') && '🔐 Connect Wallet & Claim'}
              </button>
            )}

            {error && <div className="claim-error">{error}</div>}
          </>
        )}
      </div>
    </div>
  );
}
