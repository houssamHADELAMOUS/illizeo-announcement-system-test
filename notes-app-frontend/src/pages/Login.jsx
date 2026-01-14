import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCurrentSubdomain } from '../utils/subdomain';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const currentSubdomain = getCurrentSubdomain();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      companySubdomain: currentSubdomain || ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      companySubdomain: Yup.string()
        .required('Company subdomain is required')
        .matches(/^[a-zA-Z0-9-]+$/, 'Subdomain can only contain letters, numbers, and hyphens')
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      const result = await login(values.email, values.password, values.companySubdomain);
      setIsLoading(false);
      
      if (result.success) {
        toast.success('Login successful!');
        // Redirect to dashboard on the subdomain
        const { companySubdomain } = values;
        import('../utils/subdomain').then(({ getUrlWithSubdomain }) => {
          window.location.href = getUrlWithSubdomain(companySubdomain) + '/dashboard';
        });
      } else {
        toast.error(result.message || 'Login failed');
      }
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 w-full">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-lg mx-auto">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              register a new company
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="space-y-4">
            {/* Company Subdomain */}
            <div>
              <label htmlFor="companySubdomain" className="block text-sm font-medium text-gray-700 mb-1">
                Company Subdomain
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="companySubdomain"
                  name="companySubdomain"
                  type="text"
                  placeholder="your-company"
                  className={`appearance-none text-black relative block w-full pl-10 pr-3 py-2 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm ${
                    formik.touched.companySubdomain && formik.errors.companySubdomain
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-indigo-500'
                  }`}
                  {...formik.getFieldProps('companySubdomain')}
                />
              </div>
              {formik.touched.companySubdomain && formik.errors.companySubdomain && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.companySubdomain}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`appearance-none text-black relative block w-full pl-10 pr-3 py-2 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm ${
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

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`appearance-none text-black relative block w-full pl-10 pr-10 py-2 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm ${
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
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
