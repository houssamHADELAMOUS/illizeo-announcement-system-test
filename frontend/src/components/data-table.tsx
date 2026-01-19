import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Trash2, Eye, Settings2, Search } from "lucide-react"

interface DataTableColumn<T> {
  header: string
  accessor: keyof T | string
  render?: (value: any, row: T) => React.ReactNode
  filterable?: boolean
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  onDelete?: (id: number) => void
  onView?: (id: number) => void
  isLoading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  statusFilter?: boolean
}

export function DataTable<T extends { id: number }>({
  columns,
  data,
  onDelete,
  onView,
  isLoading = false,
  searchable = true,
  searchPlaceholder = "Search...",
  statusFilter = true,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilterValue, setStatusFilterValue] = useState<string>("all")
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    columns.reduce((acc, col) => ({ ...acc, [String(col.accessor)]: true }), {})
  )

  // Filter data based on search and status
  const filteredData = data.filter((row) => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      columns.some((col) => {
        const value = (row as any)[col.accessor as string]
        if (typeof value === "string") {
          return value.toLowerCase().includes(searchQuery.toLowerCase())
        }
        if (value?.name) {
          return value.name.toLowerCase().includes(searchQuery.toLowerCase())
        }
        return false
      })

    // Status filter
    const matchesStatus = statusFilterValue === "all" || 
      (row as any).status === statusFilterValue

    return matchesSearch && matchesStatus
  })

  const toggleColumnVisibility = (accessor: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [accessor]: !prev[accessor],
    }))
  }

  const visibleColumnsList = columns.filter(
    (col) => visibleColumns[String(col.accessor)]
  )

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          {/* Search */}
          {searchable && (
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          )}

          {/* Status Filter */}
          {statusFilter && (
            <Select value={statusFilterValue} onValueChange={setStatusFilterValue}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Column Visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              <Settings2 className="mr-2 h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={String(column.accessor)}
                checked={visibleColumns[String(column.accessor)]}
                onCheckedChange={() => toggleColumnVisibility(String(column.accessor))}
              >
                {column.header}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      {filteredData.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No data available</div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                {visibleColumnsList.map((column) => (
                  <TableHead key={String(column.accessor)} className="font-semibold">
                    {column.header}
                  </TableHead>
                ))}
                {(onDelete || onView) && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {visibleColumnsList.map((column) => (
                    <TableCell key={String(column.accessor)} className="py-3">
                      {column.render
                        ? column.render((row as any)[column.accessor as string], row)
                        : (row as any)[column.accessor as string]}
                    </TableCell>
                  ))}
                  {(onDelete || onView) && (
                    <TableCell className="text-right space-x-2">
                      {onView && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onView(row.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(row.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredData.length} of {data.length} results
      </div>
    </div>
  )
}
