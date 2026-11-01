/**
 * Validation utilities conforming to backend IAM constraints:
 * - Email: non-blank, valid email pattern, max 150 chars
 * - Password: 8 to 100 chars, non-blank
 * - Name: non-blank, max 100 chars
 */

export function validateEmail(email) {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  const trimmed = email.trim();
  if (trimmed.length > 150) {
    return 'Email must not exceed 150 characters';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return 'Enter a valid email address';
  }
  return null;
}

export function validatePassword(password) {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (password.length > 100) {
    return 'Password must not exceed 100 characters';
  }
  return null;
}

export function validateName(name) {
  if (!name || !name.trim()) {
    return 'Full name is required';
  }
  const trimmed = name.trim();
  if (trimmed.length > 100) {
    return 'Name must not exceed 100 characters';
  }
  return null;
}
