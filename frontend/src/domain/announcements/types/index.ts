export interface Announcement {
  id: number
  user_id: number
  title: string
  content: string
  status: 'draft' | 'published' | 'archived'
  user?: {
    id: number
    name: string
    email: string
  }
  created_at: string
  updated_at: string
}

export interface AnnouncementsResponse {
  data: Announcement[]
  meta: {
    current_page: number
    last_page: number
    total: number
    per_page: number
  }
}

export interface CreateAnnouncementData {
  title: string
  content: string
  status: 'draft' | 'published'
}

export interface UpdateAnnouncementData {
  title?: string
  content?: string
  status?: 'draft' | 'published'
}
