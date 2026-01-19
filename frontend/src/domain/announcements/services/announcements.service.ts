import apiClient from '@/shared/api/client'
import type {
  Announcement,
  AnnouncementsResponse,
  CreateAnnouncementData,
  UpdateAnnouncementData,
} from '@/domain/announcements/types'

export const announcementsService = {
  /**
   * Fetch all published announcements
   */
  async getPublishedAnnouncements(page: number = 1): Promise<AnnouncementsResponse> {
    const response = await apiClient.get<AnnouncementsResponse>('/api/announcements', {
      params: {
        status: 'published',
        page,
      },
    })
    return response.data
  },

  /**
   * Fetch announcements created by current user
   */
  async getMyAnnouncements(page: number = 1): Promise<AnnouncementsResponse> {
    const response = await apiClient.get<AnnouncementsResponse>('/api/announcements/my', {
      params: {
        page,
      },
    })
    return response.data
  },

  /**
   * Fetch announcements created by other users (admin only)
   */
  async getUserAnnouncements(page: number = 1): Promise<AnnouncementsResponse> {
    const response = await apiClient.get<AnnouncementsResponse>('/api/announcements/users', {
      params: {
        page,
      },
    })
    return response.data
  },

  /**
   * Get a single announcement by ID
   */
  async getAnnouncement(id: number): Promise<Announcement> {
    const response = await apiClient.get<{ announcement: Announcement }>(`/api/announcements/${id}`)
    return response.data.announcement
  },

  /**
   * Create a new announcement
   */
  async createAnnouncement(data: CreateAnnouncementData): Promise<Announcement> {
    const response = await apiClient.post<{ message: string; announcement: Announcement }>('/api/announcements', data)
    return response.data.announcement
  },

  /**
   * Update an existing announcement
   */
  async updateAnnouncement(id: number, data: UpdateAnnouncementData): Promise<Announcement> {
    const response = await apiClient.put<{ message: string; announcement: Announcement }>(`/api/announcements/${id}`, data)
    return response.data.announcement
  },

  /**
   * Delete an announcement
   */
  async deleteAnnouncement(id: number): Promise<void> {
    await apiClient.delete(`/api/announcements/${id}`)
  },
}
