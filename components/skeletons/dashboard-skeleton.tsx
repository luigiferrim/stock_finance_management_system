import * as React from "react"

import { PageContainer } from "@/components/layout/page-container"
import { Skeleton } from "@/components/ui/skeleton"
import { CardGridSkeleton } from "@/components/skeletons/card-grid-skeleton"

const CARD = "rounded-2xl border-0 shadow-sm bg-white"

/**
 * Full-page placeholder for the Dashboard. Reproduces the header, the
 * "Operação" KPI row, the charts row (grouped bars + donut) and the financial
 * KPI grids so the layout stays stable while the stats request resolves.
 */
function DashboardSkeleton() {
  return (
    <PageContainer role="status" aria-busy="true" aria-live="polite" className="space-y-8">
      <span className="sr-only">Carregando o dashboard…</span>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      {/* Operação */}
      <div>
        <Skeleton className="h-6 w-28 mb-4" />
        <CardGridSkeleton
          count={3}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          cardClassName={CARD}
          showIcon
          showSub
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${CARD} p-6 space-y-4`}>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-56 max-w-full" />
          <Skeleton className="h-[240px] w-full rounded-xl" />
        </div>
        <div className={`${CARD} p-6 space-y-4`}>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-24" />
          <div className="flex justify-center py-2">
            <Skeleton className="size-[170px] rounded-full" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financeiro */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3 w-96 max-w-full" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-3 w-44" />
          <CardGridSkeleton
            count={3}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            cardClassName={CARD}
            showIcon
            showSub
          />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-3 w-40" />
          <CardGridSkeleton
            count={4}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
            cardClassName={CARD}
            showIcon
            showSub
          />
        </div>
      </div>
    </PageContainer>
  )
}

export { DashboardSkeleton }
