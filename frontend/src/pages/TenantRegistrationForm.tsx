import { useState } from 'react'
import { useFormik } from 'formik'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field as FieldWrapper,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import * as Yup from 'yup'
import { CheckCircle, Building2, User, ChevronLeft, ChevronRight } from 'lucide-react'
import apiClient from '@/shared/api/client'
import { Spinner } from '@/components/ui/spinner'

interface TenantFormData {
  company_name: string
  company_email: string
  domain: string
  admin_name: string
  admin_email: string
  admin_password: string
  admin_password_confirmation: string
}

const validationSchema = Yup.object({
  company_name: Yup.string().required('Company name is required'),
  company_email: Yup.string().email('Invalid email').required('Company email is required'),
  domain: Yup.string()
    .required('Domain is required')
    .matches(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens')
    .min(3, 'At least 3 characters'),
  admin_name: Yup.string().required('Name is required'),
  admin_email: Yup.string().email('Invalid email').required('Email is required'),
  admin_password: Yup.string()
    .required('Password is required')
    .min(8, 'Min 8 characters')
    .matches(/[A-Z]/, 'Need uppercase')
    .matches(/[a-z]/, 'Need lowercase')
    .matches(/[0-9]/, 'Need number'),
  admin_password_confirmation: Yup.string()
    .required('Confirm password')
    .oneOf([Yup.ref('admin_password')], 'Passwords must match'),
})

export default function TenantRegistration() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formik = useFormik<TenantFormData>({
    initialValues: {
      company_name: '',
      company_email: '',
      domain: '',
      admin_name: '',
      admin_email: '',
      admin_password: '',
      admin_password_confirmation: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setError(null)
      try {
        await apiClient.get('/sanctum/csrf-cookie')
        await apiClient.post('/api/tenants', values)
        setIsSuccess(true)
        setTimeout(() => {
          // lvh.me resolves all subdomains to 127.0.0.1 automatically
          window.location.href = `http://${values.domain}.lvh.me:3000/login`
        }, 2000)
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } }
        setError(error.response?.data?.message || 'Registration failed')
      }
    },
  })

  if (isSuccess) {
    return (
      <div className="h-svh bg-gradient-to-br from-purple-100 via-white to-orange-50 dark:from-purple-950 dark:via-gray-900 dark:to-orange-950 flex items-center justify-center p-4">
        <div className="fixed top-4 right-4">
          <ThemeToggle />
        </div>

        <Card className="w-full max-w-sm border-none  bg-white/80 dark:bg-gray-900/80 backdrop-blur">
          <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Workspace Created!</h2>
              <p className="text-muted-foreground text-sm mt-1">
                <strong>{formik.values.domain}.illizeo.com</strong>
              </p>
              <p className="text-xs text-muted-foreground mt-2">Redirecting to login...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-svh bg-gradient-to-br from-purple-100 via-white to-orange-50 dark:from-purple-950 dark:via-gray-900 dark:to-orange-950 flex items-center justify-center p-4 overflow-hidden">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-3xl border-none shadow-none bg-white/90 dark:bg-gray-900/90 backdrop-blur overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Form Side */}
          <div className="p-4">
            <form onSubmit={formik.handleSubmit}>
              <FieldGroup>
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-2">
                  <img src="/loginlogo.png" alt="Illizeo" className="h-12 mb-1" />
                  <h1 className="text-sm font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                    Create Your Workspace
                  </h1>
                </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-xs p-2 rounded-md">
                  {error}
                </div>
              )}

              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer transition-colors",
                    currentStep >= 1
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                  )}
                  onClick={() => setCurrentStep(1)}
                >
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-700">
                  <div className={cn("h-full bg-purple-600 transition-all", currentStep >= 2 ? "w-full" : "w-0")} />
                </div>
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer transition-colors",
                    currentStep >= 2
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                  )}
                  onClick={() => currentStep > 1 && setCurrentStep(2)}
                >
                  <User className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground mb-1">
                Step {currentStep} of 2: {currentStep === 1 ? 'Company Info' : 'Admin Account'}
              </p>

              {/* Step 1: Company Info */}
              {currentStep === 1 && (
                <div className="space-y-2">
                  <FieldWrapper>
                    <FieldLabel htmlFor="company_name" className="text-xs">Company Name</FieldLabel>
                    <Input
                      id="company_name"
                      name="company_name"
                      placeholder="Acme Inc."
                      value={formik.values.company_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={cn(
                        "h-8 text-xs px-3",
                        formik.touched.company_name && formik.errors.company_name && 'border-destructive'
                      )}
                    />
                    {formik.touched.company_name && formik.errors.company_name && (
                      <FieldDescription className="text-destructive text-xs">
                        {formik.errors.company_name}
                      </FieldDescription>
                    )}
                  </FieldWrapper>

                  <FieldWrapper>
                    <FieldLabel htmlFor="company_email" className="text-xs">Company Email</FieldLabel>
                    <Input
                      id="company_email"
                      name="company_email"
                      type="email"
                      placeholder="company@example.com"
                      value={formik.values.company_email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={cn(
                        "h-8 text-xs px-3",
                        formik.touched.company_email && formik.errors.company_email && 'border-destructive'
                      )}
                    />
                    {formik.touched.company_email && formik.errors.company_email && (
                      <FieldDescription className="text-destructive text-xs">
                        {formik.errors.company_email}
                      </FieldDescription>
                    )}
                  </FieldWrapper>

                  <FieldWrapper>
                    <FieldLabel htmlFor="domain" className="text-xs">Workspace Domain</FieldLabel>
                    <div className="flex items-center">
                      <Input
                        id="domain"
                        name="domain"
                        placeholder="yourcompany"
                        value={formik.values.domain}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={cn(
                          "h-8 text-xs px-3 rounded-r-none",
                          formik.touched.domain && formik.errors.domain && 'border-destructive'
                        )}
                      />
                      <div className="bg-muted border border-l-0 border-input px-2 h-8 flex items-center rounded-r-md text-muted-foreground text-xs">
                        .illizeo.com
                      </div>
                    </div>
                    {formik.touched.domain && formik.errors.domain && (
                      <FieldDescription className="text-destructive text-xs">
                        {formik.errors.domain}
                      </FieldDescription>
                    )}
                  </FieldWrapper>

                  <Button
                    type="button"
                    onClick={async () => {
                      const errors = await formik.validateForm()
                      formik.setTouched({ company_name: true, company_email: true, domain: true })
                      if (!errors.company_name && !errors.company_email && !errors.domain) {
                        setCurrentStep(2)
                      }
                    }}
                    className="w-full mt-2 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Step 2: Admin Account */}
              {currentStep === 2 && (
                <div className="space-y-2">
                  <FieldWrapper>
                    <FieldLabel htmlFor="admin_name" className="text-xs">Full Name</FieldLabel>
                    <Input
                      id="admin_name"
                      name="admin_name"
                      placeholder="John Doe"
                      value={formik.values.admin_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={cn(
                        "h-8 text-xs px-3",
                        formik.touched.admin_name && formik.errors.admin_name && 'border-destructive'
                      )}
                    />
                    {formik.touched.admin_name && formik.errors.admin_name && (
                      <FieldDescription className="text-destructive text-xs">
                        {formik.errors.admin_name}
                      </FieldDescription>
                    )}
                  </FieldWrapper>

                  <FieldWrapper>
                    <FieldLabel htmlFor="admin_email" className="text-xs">Email</FieldLabel>
                    <Input
                      id="admin_email"
                      name="admin_email"
                      type="email"
                      placeholder="admin@example.com"
                      value={formik.values.admin_email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={cn(
                        "h-8 text-xs px-3",
                        formik.touched.admin_email && formik.errors.admin_email && 'border-destructive'
                      )}
                    />
                    {formik.touched.admin_email && formik.errors.admin_email && (
                      <FieldDescription className="text-destructive text-xs">
                        {formik.errors.admin_email}
                      </FieldDescription>
                    )}
                  </FieldWrapper>

                  <FieldWrapper>
                    <FieldLabel htmlFor="admin_password" className="text-xs">Password</FieldLabel>
                    <Input
                      id="admin_password"
                      name="admin_password"
                      type="password"
                      placeholder="••••••••"
                      value={formik.values.admin_password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={cn(
                        "h-8 text-xs px-3",
                        formik.touched.admin_password && formik.errors.admin_password && 'border-destructive'
                      )}
                    />
                    {formik.touched.admin_password && formik.errors.admin_password && (
                      <FieldDescription className="text-destructive text-xs">
                        {formik.errors.admin_password}
                      </FieldDescription>
                    )}
                    <FieldDescription className="text-xs">
                      Min 8 chars with uppercase, lowercase, and number
                    </FieldDescription>
                  </FieldWrapper>

                  <FieldWrapper>
                    <FieldLabel htmlFor="admin_password_confirmation" className="text-xs">Confirm Password</FieldLabel>
                    <Input
                      id="admin_password_confirmation"
                      name="admin_password_confirmation"
                      type="password"
                      placeholder="••••••••"
                      value={formik.values.admin_password_confirmation}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={cn(
                        "h-8 text-xs px-3",
                        formik.touched.admin_password_confirmation && formik.errors.admin_password_confirmation && 'border-destructive'
                      )}
                    />
                    {formik.touched.admin_password_confirmation && formik.errors.admin_password_confirmation && (
                      <FieldDescription className="text-destructive text-xs">
                        {formik.errors.admin_password_confirmation}
                      </FieldDescription>
                    )}
                  </FieldWrapper>

                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={formik.isSubmitting}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
                    >
                      {formik.isSubmitting ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Creating...
                        </>
                      ) : (
                        'Create Workspace'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <p className="text-center text-xs text-muted-foreground mt-3">
                Already have a workspace?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </FieldGroup>
          </form>
          </div>

          {/* Image Side */}
          <div className="relative hidden md:block">
            <img
              src="/register-image.png"
              alt="Workspace"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-75"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
