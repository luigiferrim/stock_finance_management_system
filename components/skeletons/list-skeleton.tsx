import * as React from "react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface ListSkeletonProps {
  /** Number of list rows to render. */
  rows?: number
  /** Render a placeholder block on the trailing edge (e.g. a date or action). */
  showTrailing?: boolean
  className?: string
  rowClassName?: string
}

/**
 * Vertical list placeholder: a stack of bordered rows, each with a couple of
 * text lines on the leading edge and an optional trailing block. Used for the
 * event feed (Histórico) and the members / requests lists (Configurações).
 */
function ListSkeleton({
  rows = 5,
  showTrailing = true,
  className,
  rowClassName,
}: ListSkeletonProps) {
  const rowKeys = Array.from({ length: rows }, (_, index) => index)

  return (
    <div className={cn("space-y-3", className)}>
      {rowKeys.map((row) => (
        <div
          key={row}
          className={cn(
            "flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3",
            rowClassName,
          )}
        >
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          {showTrailing ? <Skeleton className="h-8 w-20 shrink-0" /> : null}
        </div>
      ))}
    </div>
  )
}

export { ListSkeleton }
