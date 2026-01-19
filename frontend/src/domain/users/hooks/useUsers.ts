import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '../services/user.service'
import type { CreateUserData } from '../types'

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
  })
}

export const useUser = (id: number) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userService.getById(id),
    enabled: !!id,
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserData) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
