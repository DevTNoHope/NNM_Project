import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import withdrawApi from '@/api/withdraw.api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/common/Button';

const WithdrawalVerification = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Thiếu mã xác thực.');
        return;
      }

      try {
        const res = await withdrawApi.verifyRequest(token);
        setStatus('success');
        setMessage(res.data?.data?.message || 'Verification successful!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Invalid or expired verification token.');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      {status === 'loading' && (
        <>
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Verifying your withdrawal request...</p>
        </>
      )}

      {status === 'success' && (
        <div className="bg-green-50 p-8 rounded-xl border border-green-200 max-w-md">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-green-800 mb-2">Success!</h1>
          <p className="text-green-700 mb-6">{message}</p>
          <Button variant="primary" onClick={() => navigate('/my-projects')}>
            Back to My Projects
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 p-8 rounded-xl border border-red-200 max-w-md">
          <div className="text-red-500 text-5xl mb-4">✕</div>
          <h1 className="text-2xl font-bold text-red-800 mb-2">Failed</h1>
          <p className="text-red-700 mb-6">{message}</p>
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      )}
    </div>
  );
};

export default WithdrawalVerification;
