import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { validateEmail } from '../utils/validation';
import { KeyRound, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await authApi.forgotPassword({ email: email.trim() });
      setIsSubmitted(true);
    } catch (err) {
      // Keep message generic even on errors unless validation error
      if (err.validationErrors?.email) {
        setError(err.validationErrors.email);
      } else {
        setApiError(err.message || 'Unable to process reset request at this time.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md">
        <Card className="p-8 text-center shadow-card border-cream-400">
          <div className="w-12 h-12 rounded-full bg-status-success-bg text-status-success border border-status-success-border mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h2 className="font-display text-2xl font-bold text-espresso-800">
            Request Processed
          </h2>
          
          <div className="mt-4 p-4 rounded-card bg-cream-50 border border-cream-400 text-left text-xs text-espresso-700 space-y-2">
            <p className="font-semibold text-espresso-800">Password Reset Instructions</p>
            <p>
              If an active account exists for <span className="font-semibold text-espresso-900">{email}</span>, password reset instructions and a secure one-time token have been generated.
            </p>
            <p className="text-espresso-500 pt-1 border-t border-cream-300">
              Note: Tokens expire after 15 minutes. In local development environments, check the application server console logs for the reset token/link.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/reset-password')}
              icon={ArrowRight}
              iconPosition="right"
            >
              Enter Reset Token
            </Button>
            <Link
              to="/login"
              className="text-xs text-espresso-500 hover:text-espresso-800 py-1"
            >
              Return to Sign In
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Card className="p-8 shadow-card border-cream-400">
        <div className="text-center mb-6">
          <div className="w-11 h-11 rounded-control bg-sage-50 text-sage-600 border border-sage-200 mx-auto flex items-center justify-center mb-3">
            <KeyRound className="w-5 h-5" />
          </div>
          <h2 className="font-display text-2xl font-bold text-espresso-800">
            Forgot Password
          </h2>
          <p className="text-xs text-espresso-500 mt-1">
            Enter your email to generate a password reset request
          </p>
        </div>

        {apiError && (
          <div className="mb-5 p-3 rounded-control bg-status-error-bg border border-status-error-border flex items-start gap-2.5 text-xs text-status-error" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Account Email Address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            placeholder="you@example.com"
            error={error}
            helperText="We will generate a 15-minute one-time reset link"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
            icon={ArrowRight}
            iconPosition="right"
          >
            Send Reset Instructions
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-cream-400/80 text-center text-xs text-espresso-500">
          <Link
            to="/login"
            className="font-medium text-sage-600 hover:text-sage-700 underline"
          >
            &larr; Back to Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
}
