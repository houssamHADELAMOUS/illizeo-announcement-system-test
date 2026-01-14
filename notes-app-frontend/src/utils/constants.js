export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const NOTE_CATEGORIES = [
  { value: 'personal', label: 'Personal', color: 'bg-green-100 text-green-800' },
  { value: 'work', label: 'Work', color: 'bg-blue-100 text-blue-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' },
];

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChar: true,
};
