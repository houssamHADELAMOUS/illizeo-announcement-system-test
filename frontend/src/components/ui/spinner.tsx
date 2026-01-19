import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <Loader2 
      className={cn(
        "animate-spin text-primary",
        sizeClasses[size],
        className
      )} 
    />
  )
}

export function FullPageSpinner() {
  return (
    <div className="min-h-svh flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-purple-200 dark:border-purple-800" />
          <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-transparent border-t-purple-500 dark:border-t-orange-400 animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  )
}
