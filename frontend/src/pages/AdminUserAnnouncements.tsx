import { useState } from "react"
import { useUserAnnouncements, useDeleteAnnouncement } from "@/domain/announcements/hooks/useAnnouncements"
import { DataTable } from "@/components/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function UserAnnouncementsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useUserAnnouncements(page)
  const deleteAnnouncement = useDeleteAnnouncement()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      deleteAnnouncement.mutate(id)
    }
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-destructive text-center py-8">Error loading user announcements</div>
      </div>
    )
  }

  const columns = [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Author",
      accessor: "user",
      render: (value: any) => value?.name || "Unknown",
    },
    {
      header: "Status",
      accessor: "status",
      render: (value: string) => {
        const statusColors: Record<string, string> = {
          draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
          published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        }
        return (
          <span className={`capitalize inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>
            {value}
          </span>
        )
      },
    },
    {
      header: "Created",
      accessor: "created_at",
      render: (value: string) => formatDate(value),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Announcements</h1>
        <p className="text-muted-foreground mt-2">Manage announcements from other users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Other Users' Announcements</CardTitle>
          <CardDescription>Announcements created by other team members</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={data?.data || []}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.meta && data.meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {data.meta.current_page} of {data.meta.last_page}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page === data.meta.last_page}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
