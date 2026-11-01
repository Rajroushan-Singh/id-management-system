import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { validateEmail } from '../utils/validation';
import { AlertCircle, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    // Client-side validations
    const emailErr = validateEmail(email);
    const newErrors = {};
    if (emailErr) newErrors.email = emailErr;
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await login({ email: email.trim(), password });
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      // Map backend error messages
      if (err.status === 401) {
        setApiError('Unable to sign in with those credentials.');
      } else if (err.status === 403) {
        // Locked account or unverified email
        setApiError(
          err.message || 'Account access is restricted. Please check your verification status or contact support.'
        );
      } else {
        setApiError(err.message || 'Unable to connect to authentication server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Card className="p-8 shadow-card border-cream-400">
        <div className="text-center mb-6">
          <div className="w-11 h-11 rounded-control bg-sage-50 text-sage-600 border border-sage-200 mx-auto flex items-center justify-center mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="font-display text-2xl font-bold text-espresso-800">
            Sign In
          </h2>
          <p className="text-xs text-espresso-500 mt-1">
            Access your secure identity and permissions portal
          </p>
        </div>

        {/* Verification / Registration Success banner */}
        {successMessage && (
          <div className="mb-5 p-3 rounded-control bg-status-success-bg border border-status-success-border flex items-start gap-2.5 text-xs text-status-success">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Error Banner */}
        {apiError && (
          <div className="mb-5 p-3 rounded-control bg-status-error-bg border border-status-error-border flex items-start gap-2.5 text-xs text-status-error" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{apiError}</span>
              {apiError.toLowerCase().includes('verif') && (
                <div className="mt-1.5">
                  <Link
                    to="/verify-email"
                    className="font-semibold underline hover:text-[#9E4B40]"
                  >
                    Enter email verification token &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
            }}
            placeholder="you@example.com"
            error={errors.email}
            autoComplete="email"
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold uppercase tracking-wider text-espresso-600"
              >
                Password <span className="text-status-error">*</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-sage-600 hover:text-sage-700 font-medium transition-colors"
                tabIndex={-1}
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="login-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
              placeholder="Enter your password"
              error={errors.password}
              autoComplete="current-password"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
            icon={ArrowRight}
            iconPosition="right"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-cream-400/80 text-center text-xs text-espresso-500">
          <span>Don't have an account? </span>
          <Link
            to="/register"
            className="font-semibold text-sage-600 hover:text-sage-700 underline decoration-sage-500/40 hover:decoration-sage-600"
          >
            Create an account
          </Link>
        </div>
      </Card>
    </div>
  );
}
