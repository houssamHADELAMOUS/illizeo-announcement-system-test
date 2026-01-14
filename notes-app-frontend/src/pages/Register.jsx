import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, Building, User, Globe, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      // Company Information
      companyName: '',
      companySubdomain: '',
      companyWebsite: '',
      
      // User Information
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: ''
    },
    validationSchema: Yup.object({
      // Company Validation
      companyName: Yup.string()
        .required('Company name is required')
        .min(2, 'Company name must be at least 2 characters')
        .max(100, 'Company name must be less than 100 characters'),
      
      companySubdomain: Yup.string()
        .required('Company subdomain is required')
        .min(3, 'Subdomain must be at least 3 characters')
        .max(50, 'Subdomain must be less than 50 characters')
        .matches(/^[a-zA-Z0-9-]+$/, 'Subdomain can only contain letters, numbers, and hyphens')
        .test('no-spaces', 'Subdomain cannot contain spaces', value => !/\s/.test(value)),
      
      companyWebsite: Yup.string()
        .url('Please enter a valid URL')
        .nullable(),
      
      // User Validation
      name: Yup.string()
        .required('Full name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters'),
      
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      
      phone: Yup.string()
        .matches(/^[+]?[\d\s-]+$/, 'Please enter a valid phone number')
        .nullable(),
      
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[0-9]/, 'Password must contain at least one number')
        .matches(/[@$!%*?&]/, 'Password must contain at least one special character')
        .required('Password is required'),
      
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Please confirm your password')
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      
      // Set subdomain for API calls
      localStorage.setItem('subdomain', values.companySubdomain);
      
      const userData = {
        name: values.name,
        email: values.email,
        password: values.password,
        password_confirmation: values.confirmPassword
      };
      
      const result = await register(userData);
      setIsLoading(false);
      
      if (result.success) {
        toast.success('Registration successful! Please login with your credentials.');
        navigate('/login');
      } else {
        toast.error(result.message || 'Registration failed');
      }
    }
  });

  // Generate subdomain suggestion
  const generateSubdomain = () => {
    const companyName = formik.values.companyName;
    if (companyName && !formik.touched.companySubdomain) {
      const subdomain = companyName
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      formik.setFieldValue('companySubdomain', subdomain);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8 w-full">
      <div className="w-full max-w-2xl space-y-8 bg-white p-8 rounded-2xl shadow-lg mx-auto">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register your company
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to an existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Company Information */}
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-indigo-600" />
                  Company Information
                </h3>
              </div>
              
              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    className={`appearance-none relative block w-full pl-10 pr-3 py-2 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm ${
                      formik.touched.companyName && formik.errors.companyName
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                    {...formik.getFieldProps('companyName')}
                    onBlur={(e) => {
                      formik.handleBlur(e);
                      generateSubdomain();
                    }}
                  />
                </div>
                {formik.touched.companyName && formik.errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.companyName}</p>
                )}
              </div>
              
              {/* Company Subdomain */}
              <div>
                <label htmlFor="companySubdomain" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Subdomain *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    https://
                  </span>
                  <div className="relative flex-1">
                    <input
                      id="companySubdomain"
                      name="companySubdomain"
                      type="text"
                      className={`appearance-none relative block w-full pl-3 pr-3 py-2 border rounded-r-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm ${
                        formik.touched.companySubdomain && formik.errors.companySubdomain
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-indigo-500'
                      }`}
                      {...formik.getFieldProps('companySubdomain')}
                    />
                  </div>
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    .localhost
                  </span>
                </div>
                {formik.touched.companySubdomain && formik.errors.companySubdomain && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.companySubdomain}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  This will be your unique URL for accessing the application
                </p>
              </div>
              
              {/* Company Website */}
              <div>
                <label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Website
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="companyWebsite"
                    name="companyWebsite"
                    type="url"
                    placeholder="https://example.com"
                    className={`appearance-none relative block w-full pl-10 pr-3 py-2 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm ${
                      formik.touched.companyWebsite && formik.errors.companyWebsite
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                    {...formik.getFieldProps('companyWebsite')}
                  />
                </div>
                {formik.touched.companyWebsite && formik.errors.companyWebsite && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.companyWebsite}</p>
                )}
              </div>
            </div>
            
            {/* Right Column - User Information */}
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-indigo-600" />
                  Admin User Information
                </h3>
              </div>
              
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className={`appearance-none relative block w-full pl-10 pr-3 py-2 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm ${
                      formik.touched.name && formik.errors.name
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                    {...formik.getFieldProps('name')}
                  />
                </div>
                {formik.touched.name && formik.errors.name && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.name}</p>
                )}
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`appearance-none relative block w-full pl-10 pr-3 py-2 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm ${
                      formik.touched.email && formik.errors.email
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                    {...formik.getFieldProps('email')}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
                )}
              </div>
              
              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className={`appearance-none relative block w-full pl-10 pr-3 py-2 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm ${
                      formik.touched.phone && formik.errors.phone
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                    {...formik.getFieldProps('phone')}
                  />
                </div>
                {formik.touched.phone && formik.errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.phone}</p>
                )}
              </div>
              
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`appearance-none relative block w-full pl-10 pr-10 py-2 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm ${
                      formik.touched.password && formik.errors.password
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                    {...formik.getFieldProps('password')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
                )}
                <div className="mt-2 text-xs text-gray-600 space-y-1">
                  <p>Password must contain:</p>
                  <ul className="list-disc list-inside ml-2">
                    <li className={formik.values.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                      At least 8 characters
                    </li>
                    <li className={/[a-z]/.test(formik.values.password) ? 'text-green-600' : 'text-gray-500'}>
                      One lowercase letter
                    </li>
                    <li className={/[A-Z]/.test(formik.values.password) ? 'text-green-600' : 'text-gray-500'}>
                      One uppercase letter
                    </li>
                    <li className={/[0-9]/.test(formik.values.password) ? 'text-green-600' : 'text-gray-500'}>
                      One number
                    </li>
                    <li className={/[@$!%*?&]/.test(formik.values.password) ? 'text-green-600' : 'text-gray-500'}>
                      One special character (@$!%*?&)
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`appearance-none relative block w-full pl-10 pr-10 py-2 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm ${
                      formik.touched.confirmPassword && formik.errors.confirmPassword
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                    {...formik.getFieldProps('confirmPassword')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <a href="#" className="text-indigo-600 hover:text-indigo-500">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-indigo-600 hover:text-indigo-500">
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
