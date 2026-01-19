import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useUsers, useCreateUser, useDeleteUser } from '@/domain/users/hooks/useUsers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Field as FieldWrapper,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Plus, Trash2, UserPlus, Users as UsersIcon, Shield, User as UserIcon, Megaphone } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

const createUserSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Min 8 characters'),
  password_confirmation: Yup.string()
    .required('Confirm password')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
  role: Yup.string().oneOf(['admin', 'user']).required('Role is required'),
})

export default function UsersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { data: users, isLoading } = useUsers()
  const createUser = useCreateUser()
  const deleteUser = useDeleteUser()

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'user' as 'admin' | 'user',
    },
    validationSchema: createUserSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await createUser.mutateAsync(values)
        toast.success('User created successfully')
        resetForm()
        setIsCreateOpen(false)
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } }
        toast.error(err.response?.data?.message || 'Failed to create user')
      }
    },
  })

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteUser.mutateAsync(id)
        toast.success('User deleted successfully')
      } catch {
        toast.error('Failed to delete user')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UsersIcon className="h-6 w-6 text-purple-600" />
          <h1 className="text-2xl font-bold">Users</h1>
          <Badge variant="secondary" className="ml-2">
            {users?.length || 0} users
          </Badge>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-purple-600" />
                Create New User
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={formik.handleSubmit}>
              <FieldGroup className="space-y-3">
                <FieldWrapper>
                  <FieldLabel htmlFor="name" className="text-sm">Full Name</FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={cn(
                      "h-9",
                      formik.touched.name && formik.errors.name && 'border-destructive'
                    )}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <FieldDescription className="text-destructive text-xs">
                      {formik.errors.name}
                    </FieldDescription>
                  )}
                </FieldWrapper>

                <FieldWrapper>
                  <FieldLabel htmlFor="email" className="text-sm">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={cn(
                      "h-9",
                      formik.touched.email && formik.errors.email && 'border-destructive'
                    )}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <FieldDescription className="text-destructive text-xs">
                      {formik.errors.email}
                    </FieldDescription>
                  )}
                </FieldWrapper>

                <FieldWrapper>
                  <FieldLabel htmlFor="role" className="text-sm">Role</FieldLabel>
                  <Select
                    value={formik.values.role}
                    onValueChange={(value) => formik.setFieldValue('role', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          User
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Admin
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FieldWrapper>

                <FieldWrapper>
                  <FieldLabel htmlFor="password" className="text-sm">Password</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={cn(
                      "h-9",
                      formik.touched.password && formik.errors.password && 'border-destructive'
                    )}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <FieldDescription className="text-destructive text-xs">
                      {formik.errors.password}
                    </FieldDescription>
                  )}
                </FieldWrapper>

                <FieldWrapper>
                  <FieldLabel htmlFor="password_confirmation" className="text-sm">Confirm Password</FieldLabel>
                  <Input
                    id="password_confirmation"
                    name="password_confirmation"
                    type="password"
                    placeholder="••••••••"
                    value={formik.values.password_confirmation}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={cn(
                      "h-9",
                      formik.touched.password_confirmation && formik.errors.password_confirmation && 'border-destructive'
                    )}
                  />
                  {formik.touched.password_confirmation && formik.errors.password_confirmation && (
                    <FieldDescription className="text-destructive text-xs">
                      {formik.errors.password_confirmation}
                    </FieldDescription>
                  )}
                </FieldWrapper>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createUser.isPending}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
                  >
                    {createUser.isPending ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create User'
                    )}
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Announcements</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                        className={cn(
                          user.role === 'admin' && 'bg-purple-600 hover:bg-purple-700'
                        )}
                      >
                        {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Megaphone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{user.announcements_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id, user.name)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UsersIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No users yet</p>
              <p className="text-sm text-muted-foreground/70">
                Click "Add User" to create the first user
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
