import * as React from "react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface TableSkeletonProps {
  /** Number of columns to mimic. */
  columns?: number
  /** Number of body rows to render. */
  rows?: number
  className?: string
}

/**
 * Table-shaped placeholder: a bordered card with a header row and `rows`
 * body rows of `columns` cells each. Mirrors the real tables used in the
 * Estoque and Financeiro screens to avoid layout shift while data loads.
 */
function TableSkeleton({ columns = 6, rows = 6, className }: TableSkeletonProps) {
  const columnKeys = Array.from({ length: columns }, (_, index) => index)
  const rowKeys = Array.from({ length: rows }, (_, index) => index)

  return (
    <div
      className={cn("overflow-hidden rounded-lg border border-border bg-white", className)}
    >
      {/* Header */}
      <div className="flex gap-4 border-b border-border bg-muted/30 px-4 py-3.5">
        {columnKeys.map((column) => (
          <Skeleton key={column} className="h-4 flex-1" />
        ))}
      </div>

      {/* Body rows */}
      {rowKeys.map((row) => (
        <div key={row} className="flex items-center gap-4 border-b border-border px-4 py-4 last:border-b-0">
          {columnKeys.map((column) => (
            <Skeleton
              key={column}
              className={cn("h-4 flex-1", column === 0 && "max-w-[40%]")}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export { TableSkeleton }
