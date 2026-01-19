import apiClient from '@/shared/api/client'
import type {
  Announcement,
  AnnouncementsResponse,
  CreateAnnouncementData,
  UpdateAnnouncementData,
} from '@/domain/announcements/types'

export const announcementsService = {
  // get published
  async getPublishedAnnouncements(page: number = 1): Promise<AnnouncementsResponse> {
    const response = await apiClient.get<AnnouncementsResponse>('/api/announcements', {
      params: {
        status: 'published',
        page,
      },
    })
    return response.data
  },

  // get my announcements
  async getMyAnnouncements(page: number = 1): Promise<AnnouncementsResponse> {
    const response = await apiClient.get<AnnouncementsResponse>('/api/announcements/my', {
      params: {
        page,
      },
    })
    return response.data
  },

  // get user announcements (admin)
  async getUserAnnouncements(page: number = 1): Promise<AnnouncementsResponse> {
    const response = await apiClient.get<AnnouncementsResponse>('/api/announcements/users', {
      params: {
        page,
      },
    })
    return response.data
  },

  // get single
  async getAnnouncement(id: number): Promise<Announcement> {
    const response = await apiClient.get<{ announcement: Announcement }>(`/api/announcements/${id}`)
    return response.data.announcement
  },

  // create
  async createAnnouncement(data: CreateAnnouncementData): Promise<Announcement> {
    const response = await apiClient.post<{ message: string; announcement: Announcement }>('/api/announcements', data)
    return response.data.announcement
  },

  // update
  async updateAnnouncement(id: number, data: UpdateAnnouncementData): Promise<Announcement> {
    const response = await apiClient.put<{ message: string; announcement: Announcement }>(`/api/announcements/${id}`, data)
    return response.data.announcement
  },

  // delete
  async deleteAnnouncement(id: number): Promise<void> {
    await apiClient.delete(`/api/announcements/${id}`)
  },
}
