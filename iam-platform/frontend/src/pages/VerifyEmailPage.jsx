import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { CheckCircle2, AlertCircle, MailCheck, ArrowRight } from 'lucide-react';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token') || '';

  const [tokenInput, setTokenInput] = useState(tokenFromUrl);
  const [status, setStatus] = useState(tokenFromUrl ? 'loading' : 'idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const executeVerification = async (tokenToVerify) => {
    if (!tokenToVerify || !tokenToVerify.trim()) {
      setStatus('error');
      setErrorMessage('Please provide a valid verification token.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      await authApi.verifyEmail(tokenToVerify.trim());
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err.message || 'The verification token is invalid or has expired. Please check the token.'
      );
    }
  };

  useEffect(() => {
    if (tokenFromUrl) {
      executeVerification(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  return (
    <div className="w-full max-w-md">
      <Card className="p-8 text-center shadow-card border-cream-400">
        <div className="w-12 h-12 rounded-full bg-sage-50 text-sage-600 border border-sage-200 mx-auto flex items-center justify-center mb-4">
          <MailCheck className="w-6 h-6" />
        </div>

        <h2 className="font-display text-2xl font-bold text-espresso-800">
          Email Verification
        </h2>
        <p className="text-xs text-espresso-500 mt-1 mb-6">
          Confirm your email address to activate your account
        </p>

        {status === 'loading' && (
          <div className="py-8 space-y-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-medium text-espresso-700">
              Verifying token with authentication server...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-5">
            <div className="p-4 rounded-card bg-status-success-bg border border-status-success-border text-status-success text-sm flex items-start gap-3 text-left">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Email Verified Successfully!</p>
                <p className="text-xs mt-1 text-espresso-700">
                  Your identity has been confirmed. You may now log in to access your account.
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() =>
                navigate('/login', {
                  state: { message: 'Email verified successfully. You can now log in.' },
                })
              }
              icon={ArrowRight}
              iconPosition="right"
            >
              Proceed to Sign In
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-5">
            <div className="p-4 rounded-card bg-status-error-bg border border-status-error-border text-status-error text-sm flex items-start gap-3 text-left" role="alert">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Verification Failed</p>
                <p className="text-xs mt-1 text-espresso-700">
                  {errorMessage}
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeVerification(tokenInput);
              }}
              className="space-y-3 pt-2"
            >
              <Input
                label="Enter Verification Token Manually"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste token from console / email"
                required
              />
              <Button type="submit" variant="primary" size="md" className="w-full">
                Verify Token
              </Button>
            </form>

            <div className="pt-3">
              <Link to="/login" className="text-xs text-sage-600 hover:text-sage-700 font-medium">
                &larr; Return to Sign In
              </Link>
            </div>
          </div>
        )}

        {status === 'idle' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeVerification(tokenInput);
            }}
            className="space-y-4 text-left"
          >
            <Input
              label="Verification Token"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste token from console / email link"
              helperText="Tokens expire after 24 hours"
              required
            />
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Verify Email
            </Button>
            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-sage-600 hover:text-sage-700 font-medium">
                &larr; Return to Sign In
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
