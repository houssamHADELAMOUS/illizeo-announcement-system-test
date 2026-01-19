import { useLogin } from '@/domain/auth/hooks/useAuth'
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
import { Spinner } from '@/components/ui/spinner'
import { useFormik } from 'formik'
import * as Yup from 'yup'

export default function Login() {
  const login = useLogin()

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    }),
    onSubmit: (values) => {
      login.mutate(values)
    },
  })

  return (
    <div className="bg-purple-50 min-h-svh bg-background text-foreground flex items-center justify-center p-4 dark:bg-purple-900">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <div className={cn("flex flex-col gap-6 w-full max-w-3xl dark:bg-gray-900 ")}>
        <Card className="overflow-hidden p-0 border-none shadow-none">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form className="p-6 md:p-8" onSubmit={formik.handleSubmit}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <img src="/loginlogo.png" alt="Illizeo" className='size-30 ' />
                </div>

                {login.isError && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mt-4">
                    Invalid credentials. Please try again.
                  </div>
                )}

                {formik.submitCount > 0 && formik.errors.email && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                    {formik.errors.email}
                  </div>
                )}

                <FieldWrapper>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    required
                    className={formik.touched.email && formik.errors.email ? 'border-destructive' : ''}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <FieldDescription className="text-destructive text-sm">
                      {formik.errors.email}
                    </FieldDescription>
                  )}
                </FieldWrapper>

                <FieldWrapper>
                 
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder='**********'
                    required
                    className={formik.touched.password && formik.errors.password ? 'border-destructive' : ''}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <FieldDescription className="text-destructive text-sm">
                      {formik.errors.password}
                    </FieldDescription>
                  )}
                </FieldWrapper>

                <FieldWrapper>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={login.isPending || formik.isSubmitting}
                  >
                    {login.isPending ? (
                      <>
                        <Spinner size="sm" className="mr-2 text-white" />
                        Signing in...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </FieldWrapper>

               

               <FieldDescription className="text-center">
  Already have a workspace?{' '}
  <a href="/register" className="text-primary hover:underline font-medium">
    Sign in here
  </a>
</FieldDescription>
              </FieldGroup>
            </form>

            <div className=" relative hidden md:block">
              <img
                src="/login-image.png"
                alt="Image"
                className="absolute inset-0 h-full w-full object-cover  dark:grayscale"
              />
            </div>
          </CardContent>
        </Card>

      
      </div>
    </div>
  )
}