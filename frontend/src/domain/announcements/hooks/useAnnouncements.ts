import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { announcementsService } from '@/domain/announcements/services/announcements.service'
import type { AnnouncementsResponse, Announcement, CreateAnnouncementData } from '@/domain/announcements/types'
import type { User, UsersResponse } from '@/domain/users/types'

/**
 * Hook to fetch all published announcements
 */
export const usePublishedAnnouncements = (page: number = 1) => {
  return useQuery<AnnouncementsResponse, Error>({
    queryKey: ['announcements', 'published', page],
    queryFn: () => announcementsService.getPublishedAnnouncements(page),
  })
}

/**
 * Hook to fetch current user's announcements
 */
export const useMyAnnouncements = (page: number = 1) => {
  return useQuery<AnnouncementsResponse, Error>({
    queryKey: ['announcements', 'my', page],
    queryFn: () => announcementsService.getMyAnnouncements(page),
  })
}

/**
 * Hook to fetch other users' announcements (admin only)
 */
export const useUserAnnouncements = (page: number = 1) => {
  return useQuery<AnnouncementsResponse, Error>({
    queryKey: ['announcements', 'users', page],
    queryFn: () => announcementsService.getUserAnnouncements(page),
  })
}

/**
 * Hook to fetch a single announcement
 */
export const useAnnouncement = (id: number) => {
  return useQuery<Announcement, Error>({
    queryKey: ['announcements', id],
    queryFn: () => announcementsService.getAnnouncement(id),
  })
}

/**
 * Hook to create a new announcement with optimistic update for user count
 */
export const useCreateAnnouncement = (currentUserId?: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: announcementsService.createAnnouncement,
    onMutate: async (newAnnouncement: CreateAnnouncementData) => {
      // Only do optimistic update if status is published and we have a user ID
      if (newAnnouncement.status !== 'published' || !currentUserId) {
        return {}
      }

      // Cancel outgoing refetches for users
      await queryClient.cancelQueries({ queryKey: ['users'] })

      // Snapshot previous users data
      const previousUsers = queryClient.getQueryData<UsersResponse>(['users'])

      // Optimistically increment the user's announcement count
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
      // Rollback on error
      if (context?.previousUsers) {
        queryClient.setQueryData(['users'], context.previousUsers)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    },
    onSettled: () => {
      // Always refetch users to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

/**
 * Hook to update an announcement with optimistic updates
 */
export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      announcementsService.updateAnnouncement(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['announcements'] })

      // Snapshot previous value
      const previousData = queryClient.getQueryData(['announcements', 'my', 1])

      // Optimistically update the cache
      queryClient.setQueryData(['announcements', 'my', 1], (old: any) => {
        if (!old?.data) return old
        
        // Update the item with new data
        let updatedData = old.data.map((item: any) => {
          if (item.id === id) {
            // If status is changing to published, update the timestamp to now
            const isPublishing = data.status === 'published' && item.status !== 'published'
            return {
              ...item,
              ...data,
              // Set updated_at to now when publishing so it shows as "just published"
              updated_at: isPublishing ? new Date().toISOString() : item.updated_at,
              created_at: isPublishing ? new Date().toISOString() : item.created_at,
            }
          }
          return item
        })
        
        // Sort by created_at descending so newly published items appear first
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
      // Rollback on error
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

/**
 * Hook to delete an announcement
 */
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
