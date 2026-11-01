import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Button } from '../components/ui/Button';
import { validatePassword } from '../utils/validation';
import { Key, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialToken = searchParams.get('token') || '';

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    const newErrors = {};
    if (!token || !token.trim()) {
      newErrors.token = 'Reset token is required';
    }

    const passErr = validatePassword(newPassword);
    if (passErr) {
      newErrors.newPassword = passErr;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await authApi.resetPassword({
        token: token.trim(),
        newPassword,
      });
      setIsSuccess(true);
    } catch (err) {
      if (err.validationErrors && Object.keys(err.validationErrors).length > 0) {
        setErrors(err.validationErrors);
      } else {
        setApiError(
          err.message || 'Invalid or expired password reset token. Please request a new one.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md">
        <Card className="p-8 text-center shadow-card border-cream-400">
          <div className="w-12 h-12 rounded-full bg-status-success-bg text-status-success border border-status-success-border mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h2 className="font-display text-2xl font-bold text-espresso-800">
            Password Reset Complete
          </h2>
          <p className="text-sm text-espresso-600 mt-2 leading-relaxed">
            Your password has been changed successfully. Any existing active sessions have been revoked for your security.
          </p>

          <Button
            variant="primary"
            size="lg"
            className="w-full mt-6"
            onClick={() =>
              navigate('/login', {
                state: { message: 'Password updated successfully. Please sign in with your new password.' },
              })
            }
            icon={ArrowRight}
            iconPosition="right"
          >
            Sign In with New Password
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Card className="p-8 shadow-card border-cream-400">
        <div className="text-center mb-6">
          <div className="w-11 h-11 rounded-control bg-sage-50 text-sage-600 border border-sage-200 mx-auto flex items-center justify-center mb-3">
            <Key className="w-5 h-5" />
          </div>
          <h2 className="font-display text-2xl font-bold text-espresso-800">
            Set New Password
          </h2>
          <p className="text-xs text-espresso-500 mt-1">
            Enter your reset token and define a new secure password
          </p>
        </div>

        {apiError && (
          <div className="mb-5 p-3 rounded-control bg-status-error-bg border border-status-error-border flex items-start gap-2.5 text-xs text-status-error" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{apiError}</span>
              <div className="mt-1">
                <Link to="/forgot-password" className="font-semibold underline">
                  Request a new reset token &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Reset Token"
            type="text"
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              if (errors.token) setErrors((prev) => ({ ...prev, token: null }));
            }}
            placeholder="Paste 15-minute token here"
            error={errors.token}
            helperText="From email or backend application log"
            required
          />

          <PasswordInput
            label="New Password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: null }));
            }}
            placeholder="Minimum 8 characters"
            error={errors.newPassword}
            helperText="8 to 100 characters required"
            required
          />

          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
            }}
            placeholder="Re-enter new password"
            error={errors.confirmPassword}
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
            Update Password
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
