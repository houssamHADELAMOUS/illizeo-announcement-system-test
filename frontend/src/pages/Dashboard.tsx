import { usePublishedAnnouncements } from '@/domain/announcements/hooks/useAnnouncements'
import type { Announcement } from '@/domain/announcements/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { Megaphone, RefreshCw, Clock } from 'lucide-react'
import { useState } from 'react'

// Generate consistent color for each user based on their ID
function getAvatarColor(userId: number): string {
  const colors = [
    'bg-purple-500 text-white',
    'bg-orange-500 text-white',
    'bg-purple-600 text-white',
    'bg-orange-400 text-white',
    'bg-purple-400 text-white',
  ]
  return colors[userId % colors.length]
}

function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const authorName = announcement.user?.name || 'Unknown Author'
  const authorInitials = authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const timeAgo = formatDistanceToNow(new Date(announcement.created_at), {
    addSuffix: true,
  })

  const avatarColor = getAvatarColor(announcement.user_id)

  return (
    <Card className="w-full border-border/50 bg-card hover:shadow-lg hover:shadow-purple-500/5 dark:hover:shadow-purple-400/10 transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-700">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-11 w-11 ring-2 ring-purple-200 dark:ring-purple-800">
            <AvatarFallback className={`${avatarColor} text-sm font-semibold`}>
              {authorInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{authorName}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                Author
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <h3 className="font-bold text-lg text-foreground mb-2 leading-tight">{announcement.title}</h3>
        <p className="text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed">
          {announcement.content}
        </p>
        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-medium">
              <Megaphone className="h-3.5 w-3.5" />
              Published
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AnnouncementSkeleton() {
  return (
    <Card className="w-full border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isFetching, refetch } = usePublishedAnnouncements(page)

  const announcements = data?.data || []
  const meta = data?.meta

  // Sort by created_at descending (latest first)
  const sortedAnnouncements = [...announcements].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-orange-50 dark:from-purple-950/50 dark:to-orange-950/30 p-4 rounded-xl border border-purple-200/50 dark:border-purple-800/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25">
            <Megaphone className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-700 to-orange-600 dark:from-purple-400 dark:to-orange-400 bg-clip-text text-transparent">
              Announcements
            </h1>
            <p className="text-sm text-muted-foreground">
              Latest updates from your organization
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/50 hover:border-purple-400 dark:hover:border-purple-600"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Scrollable Feed */}
      <div className="flex-1 overflow-y-auto mt-4 pr-2 space-y-4">
        {isLoading ? (
          <>
            <AnnouncementSkeleton />
            <AnnouncementSkeleton />
            <AnnouncementSkeleton />
          </>
        ) : sortedAnnouncements.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-orange-100 dark:from-purple-900 dark:to-orange-900 flex items-center justify-center">
              <Megaphone className="h-8 w-8 text-purple-500 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">No announcements yet</h3>
            <p className="text-muted-foreground text-sm">
              There are no published announcements at this time.
            </p>
          </Card>
        ) : (
          sortedAnnouncements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))
        )}
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 py-4 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isFetching}
            className="border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/50"
          >
            Previous
          </Button>
          <span className="text-sm font-medium px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
            Page {page} of {meta.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
            disabled={page === meta.last_page || isFetching}
            className="border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/50"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
