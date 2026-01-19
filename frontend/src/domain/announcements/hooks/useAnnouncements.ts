import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { announcementsService } from '@/domain/announcements/services/announcements.service'
import type { AnnouncementsResponse, Announcement, CreateAnnouncementData } from '@/domain/announcements/types'
import type { User, UsersResponse } from '@/domain/users/types'

// fetch published announcements
export const usePublishedAnnouncements = (page: number = 1) => {
  return useQuery<AnnouncementsResponse, Error>({
    queryKey: ['announcements', 'published', page],
    queryFn: () => announcementsService.getPublishedAnnouncements(page),
  })
}

// fetch my announcements
export const useMyAnnouncements = (page: number = 1) => {
  return useQuery<AnnouncementsResponse, Error>({
    queryKey: ['announcements', 'my', page],
    queryFn: () => announcementsService.getMyAnnouncements(page),
  })
}

// fetch user announcements (admin)
export const useUserAnnouncements = (page: number = 1) => {
  return useQuery<AnnouncementsResponse, Error>({
    queryKey: ['announcements', 'users', page],
    queryFn: () => announcementsService.getUserAnnouncements(page),
  })
}

// fetch single announcement
export const useAnnouncement = (id: number) => {
  return useQuery<Announcement, Error>({
    queryKey: ['announcements', id],
    queryFn: () => announcementsService.getAnnouncement(id),
  })
}

// create announcement with optimistic update
export const useCreateAnnouncement = (currentUserId?: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: announcementsService.createAnnouncement,
    onMutate: async (newAnnouncement: CreateAnnouncementData) => {
      if (newAnnouncement.status !== 'published' || !currentUserId) {
        return {}
      }

      await queryClient.cancelQueries({ queryKey: ['users'] })
      const previousUsers = queryClient.getQueryData<UsersResponse>(['users'])

      if (previousUsers) {
        queryClient.setQueryData<UsersResponse>(['users'], {
          ...previousUsers,
          users: previousUsers.users.map((user: User) =>
            user.id === currentUserId
              ? { ...user, announcements_count: user.announcements_count + 1 }
              : user
          ),
        })
      }

      return { previousUsers }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// update announcement
export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      announcementsService.updateAnnouncement(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['announcements'] })
      const previousData = queryClient.getQueryData(['announcements', 'my', 1])

      queryClient.setQueryData(['announcements', 'my', 1], (old: any) => {
        if (!old?.data) return old
        
        let updatedData = old.data.map((item: any) => {
          if (item.id === id) {
            const isPublishing = data.status === 'published' && item.status !== 'published'
            return {
              ...item,
              ...data,
              updated_at: isPublishing ? new Date().toISOString() : item.updated_at,
              created_at: isPublishing ? new Date().toISOString() : item.created_at,
            }
          }
          return item
        })
        
        updatedData = updatedData.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        
        return {
          ...old,
          data: updatedData,
        }
      })

      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['announcements', 'my', 1], context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// delete announcement
export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: announcementsService.deleteAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
