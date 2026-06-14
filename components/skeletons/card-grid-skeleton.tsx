import * as React from "react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface CardGridSkeletonProps {
  /** Number of card placeholders to render. */
  count?: number
  /** Grid classes controlling the responsive column layout. */
  className?: string
  /** Per-card wrapper classes (defaults to the shared Card look). */
  cardClassName?: string
  /** Render a trailing icon square (matches the dashboard KPI cards). */
  showIcon?: boolean
  /** Render the secondary description line below the value. */
  showSub?: boolean
}

/**
 * Grid of metric/KPI card placeholders. Each card mimics a label, a large
 * value and an optional sub-line, with an optional trailing icon square. Used
 * for the KPI grids on the Dashboard and Financeiro screens.
 */
function CardGridSkeleton({
  count = 4,
  className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
  cardClassName = "rounded-xl border bg-card shadow-sm",
  showIcon = false,
  showSub = false,
}: CardGridSkeletonProps) {
  const cardKeys = Array.from({ length: count }, (_, index) => index)

  return (
    <div className={className}>
      {cardKeys.map((card) => (
        <div key={card} className={cn("p-5", cardClassName)}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-32" />
              {showSub ? <Skeleton className="h-3 w-20" /> : null}
            </div>
            {showIcon ? <Skeleton className="size-10 shrink-0 rounded-xl" /> : null}
          </div>
        </div>
      ))}
    </div>
  )
}

export { CardGridSkeleton }
