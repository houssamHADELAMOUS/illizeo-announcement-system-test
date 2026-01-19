import { useState, useMemo } from "react"
import { useMyAnnouncements, useUpdateAnnouncement, useDeleteAnnouncement, useCreateAnnouncement } from "@/domain/announcements/hooks/useAnnouncements"
import { useUser } from "@/domain/auth/hooks/useAuth"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pencil, Trash2, GripVertical, FileEdit, Send, Plus } from "lucide-react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import type { Announcement } from "@/domain/announcements/types"

// Draggable Announcement Card
function AnnouncementCard({ 
  announcement, 
  onEdit, 
  onDelete,
  isDragging = false 
}: { 
  announcement: Announcement
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  isDragging?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: announcement.id.toString(),
    data: { announcement },
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  const isDraft = announcement.status === "draft"

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-lg group ${
        isDragging ? "opacity-50" : ""
      } ${isDraft 
        ? "border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-orange-500/10" 
        : "border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-purple-500/10"
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          {...listeners}
          {...attributes}
          className="mt-1 text-muted-foreground hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-foreground truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {announcement.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
            {announcement.content}
          </p>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:text-purple-600 dark:hover:text-purple-400"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onEdit(announcement.id)
              }}
            >
              <Pencil className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/50"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onDelete(announcement.id)
              }}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Droppable Column
function StatusColumn({ 
  status, 
  title, 
  announcements, 
  onEdit, 
  onDelete,
  icon: Icon
}: { 
  status: string
  title: string
  announcements: Announcement[]
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  icon: React.ComponentType<{ className?: string }>
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  const isDraft = status === "draft"

  return (
    <div className="flex-1 min-w-[300px]">
      <div className={`rounded-xl border-2 border-dashed p-4 min-h-[500px] transition-all duration-200 ${
        isOver 
          ? isDraft 
            ? "border-orange-400 bg-orange-50 dark:bg-orange-950/30" 
            : "border-purple-400 bg-purple-50 dark:bg-purple-950/30" 
          : isDraft 
            ? "border-orange-200 dark:border-orange-800/50 bg-orange-50/30 dark:bg-orange-950/20" 
            : "border-purple-200 dark:border-purple-800/50 bg-purple-50/30 dark:bg-purple-950/20"
      }`}>
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
          <div className={`p-1.5 rounded-lg ${isDraft ? "bg-orange-100 dark:bg-orange-900/50" : "bg-purple-100 dark:bg-purple-900/50"}`}>
            <Icon className={`h-4 w-4 ${isDraft ? "text-orange-600 dark:text-orange-400" : "text-purple-600 dark:text-purple-400"}`} />
          </div>
          <h3 className={`font-semibold ${isDraft ? "text-orange-700 dark:text-orange-300" : "text-purple-700 dark:text-purple-300"}`}>
            {title}
          </h3>
          <Badge 
            variant="secondary" 
            className={`text-xs ml-auto ${
              isDraft 
                ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" 
                : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
            }`}
          >
            {announcements.length}
          </Badge>
        </div>
        <div ref={setNodeRef} className="space-y-3">
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
          {announcements.length === 0 && (
            <div className={`text-center py-12 rounded-lg border-2 border-dashed ${
              isDraft 
                ? "border-orange-200 dark:border-orange-800/30 text-orange-400 dark:text-orange-600" 
                : "border-purple-200 dark:border-purple-800/30 text-purple-400 dark:text-purple-600"
            }`}>
              <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No {status} announcements</p>
              <p className="text-xs mt-1 opacity-75">Drag items here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MyAnnouncementsPage() {
  const { data: user } = useUser()
  const { data, isLoading, error } = useMyAnnouncements(1)
  const updateAnnouncement = useUpdateAnnouncement()
  const deleteAnnouncement = useDeleteAnnouncement()
  const createAnnouncement = useCreateAnnouncement(user?.id)
  const [activeId, setActiveId] = useState<string | null>(null)
  
  // Edit modal state
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Create modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [newStatus, setNewStatus] = useState<"draft" | "published">("draft")

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Separate announcements by status
  const { draftAnnouncements, publishedAnnouncements } = useMemo(() => {
    const announcements = data?.data || []
    return {
      draftAnnouncements: announcements.filter((a) => a.status === "draft"),
      publishedAnnouncements: announcements.filter((a) => a.status === "published"),
    }
  }, [data?.data])

  const activeAnnouncement = useMemo(() => {
    if (!activeId) return null
    return data?.data?.find((a) => a.id.toString() === activeId) || null
  }, [activeId, data?.data])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString())
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const announcementId = parseInt(active.id.toString())
    const newStatus = over.id.toString()

    // Get the current announcement
    const announcement = data?.data?.find((a) => a.id === announcementId)
    if (!announcement) return

    // Only update if status changed
    if (announcement.status !== newStatus && (newStatus === "draft" || newStatus === "published")) {
      updateAnnouncement.mutate({
        id: announcementId,
        data: { status: newStatus as "draft" | "published" },
      })
    }
  }

  const handleEdit = (id: number) => {
    const announcement = data?.data?.find((a) => a.id === id)
    if (announcement) {
      setEditingAnnouncement(announcement)
      setEditTitle(announcement.title)
      setEditContent(announcement.content)
      setIsEditModalOpen(true)
    }
  }

  const handleSaveEdit = () => {
    if (!editingAnnouncement) return
    
    updateAnnouncement.mutate({
      id: editingAnnouncement.id,
      data: { 
        title: editTitle, 
        content: editContent 
      },
    }, {
      onSuccess: () => {
        setIsEditModalOpen(false)
        setEditingAnnouncement(null)
        setEditTitle("")
        setEditContent("")
        toast.success("Announcement updated successfully!")
      },
      onError: () => {
        toast.error("Failed to update announcement. Please try again.")
      }
    })
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingAnnouncement(null)
    setEditTitle("")
    setEditContent("")
  }

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      deleteAnnouncement.mutate(id, {
        onSuccess: () => {
          toast.success("Announcement deleted successfully!")
        },
        onError: () => {
          toast.error("Failed to delete announcement. Please try again.")
        }
      })
    }
  }

  // Create announcement handlers
  const handleCreate = () => {
    setIsCreateModalOpen(true)
  }

  const handleSaveCreate = () => {
    createAnnouncement.mutate({
      title: newTitle,
      content: newContent,
      status: newStatus,
    }, {
      onSuccess: () => {
        setIsCreateModalOpen(false)
        setNewTitle("")
        setNewContent("")
        setNewStatus("draft")
        toast.success("Announcement created successfully!")
      },
      onError: (error: any) => {
        console.error("Create announcement error:", error)
        const message = error?.response?.data?.message || "Failed to create announcement. Please try again."
        toast.error(message)
      }
    })
  }

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false)
    setNewTitle("")
    setNewContent("")
    setNewStatus("draft")
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-destructive text-center py-8">Error loading your announcements</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-orange-50 dark:from-purple-950/50 dark:to-orange-950/30 p-4 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-700 to-orange-600 dark:from-purple-400 dark:to-orange-400 bg-clip-text text-transparent">
            My Announcements
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Drag and drop announcements between columns to change their status
          </p>
        </div>
        <Button 
          onClick={handleCreate}
          className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatusColumn
              status="draft"
              title="Draft"
              announcements={draftAnnouncements}
              onEdit={handleEdit}
              onDelete={handleDelete}
              icon={FileEdit}
            />
            <StatusColumn
              status="published"
              title="Published"
              announcements={publishedAnnouncements}
              onEdit={handleEdit}
              onDelete={handleDelete}
              icon={Send}
            />
          </div>

          <DragOverlay>
            {activeAnnouncement ? (
              <div className="bg-card border-2 border-purple-400 dark:border-purple-600 rounded-xl p-4 shadow-xl shadow-purple-500/20 rotate-3">
                <h4 className="font-semibold text-sm text-foreground">{activeAnnouncement.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {activeAnnouncement.content}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Edit Announcement Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
              Edit Announcement
            </DialogTitle>
            <DialogDescription>
              Make changes to your announcement. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title
              </Label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter announcement title"
                className="border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium">
                Content
              </Label>
              <Textarea
                id="content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Enter announcement content"
                rows={6}
                className="border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600 resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={handleCloseEditModal}
              className="border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={updateAnnouncement.isPending || !editTitle.trim() || !editContent.trim()}
              className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white"
            >
              {updateAnnouncement.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Announcement Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
              Create New Announcement
            </DialogTitle>
            <DialogDescription>
              Fill in the details for your new announcement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-title" className="text-sm font-medium">
                Title
              </Label>
              <Input
                id="new-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter announcement title"
                className="border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-content" className="text-sm font-medium">
                Content
              </Label>
              <Textarea
                id="new-content"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Enter announcement content"
                rows={6}
                className="border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-status" className="text-sm font-medium">
                Status
              </Label>
              <Select value={newStatus} onValueChange={(value: "draft" | "published") => setNewStatus(value)}>
                <SelectTrigger className="border-purple-200 dark:border-purple-800">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={handleCloseCreateModal}
              className="border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveCreate}
              disabled={createAnnouncement.isPending || !newTitle.trim() || !newContent.trim()}
              className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white"
            >
              {createAnnouncement.isPending ? "Creating..." : "Create Announcement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
