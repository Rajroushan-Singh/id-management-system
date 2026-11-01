import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { validateEmail, validatePassword, validateName } from '../utils/validation';
import { UserPlus, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    // Validation
    const newErrors = {};
    const nameErr = validateName(formData.name);
    if (nameErr) newErrors.name = nameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const passwordErr = validatePassword(formData.password);
    if (passwordErr) newErrors.password = passwordErr;

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await authApi.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setSuccessInfo({
        name: response.name,
        email: response.email,
        message: response.message || 'User registered successfully',
      });
    } catch (err) {
      if (err.validationErrors && Object.keys(err.validationErrors).length > 0) {
        setErrors(err.validationErrors);
      } else if (err.status === 409 || (err.message && err.message.toLowerCase().includes('already exists'))) {
        setApiError('An account with this email address already exists.');
      } else {
        setApiError(err.message || 'Registration failed. Please verify your details.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (successInfo) {
    return (
      <div className="w-full max-w-md">
        <Card className="p-8 text-center shadow-card border-cream-400">
          <div className="w-12 h-12 rounded-full bg-status-success-bg text-status-success border border-status-success-border mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="font-display text-2xl font-bold text-espresso-800">
            Account Created
          </h2>
          <p className="text-sm text-espresso-600 mt-2 leading-relaxed">
            Welcome, <span className="font-semibold text-espresso-800">{successInfo.name}</span>.
            Your account has been registered for <span className="font-medium text-espresso-800">{successInfo.email}</span>.
          </p>

          <div className="mt-5 p-4 rounded-card bg-cream-50 border border-cream-400/80 text-left text-xs text-espresso-600 space-y-2">
            <p className="font-semibold text-espresso-800">Next Step: Email Verification</p>
            <p>
              In accordance with security requirements, you must verify your email before logging in.
              In local development, check your backend server console for the generated verification link/token.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/verify-email')}
              icon={ArrowRight}
              iconPosition="right"
            >
              Verify Email Token
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
            <UserPlus className="w-5 h-5" />
          </div>
          <h2 className="font-display text-2xl font-bold text-espresso-800">
            Create Account
          </h2>
          <p className="text-xs text-espresso-500 mt-1">
            Register for access to the IAM enterprise portal
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
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Jane Doe"
            error={errors.name}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="jane@example.com"
            error={errors.email}
            required
          />

          <PasswordInput
            label="Password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="Minimum 8 characters"
            error={errors.password}
            helperText="8 to 100 characters required"
            required
          />

          <PasswordInput
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            placeholder="Re-enter your password"
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
            Create Account
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-cream-400/80 text-center text-xs text-espresso-500">
          <span>Already have an account? </span>
          <Link
            to="/login"
            className="font-semibold text-sage-600 hover:text-sage-700 underline decoration-sage-500/40 hover:decoration-sage-600"
          >
            Sign in here
          </Link>
        </div>
      </Card>
    </div>
  );
}
