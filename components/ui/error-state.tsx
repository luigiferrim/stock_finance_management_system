import * as React from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ErrorStateProps extends React.ComponentProps<"div"> {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  variant?: "page" | "section"
}

function ErrorState({
  title = "Não foi possível carregar os dados",
  message = "Tente novamente em instantes.",
  onRetry,
  retryLabel = "Tentar novamente",
  variant = "page",
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      data-slot="error-state"
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 text-center",
        variant === "page" ? "min-h-[60vh] p-8" : "min-h-48 p-6",
        className,
      )}
      {...props}
    >
      <AlertTriangle
        aria-hidden="true"
        className={cn("text-destructive", variant === "page" ? "h-10 w-10" : "h-8 w-8")}
      />
      <div className="space-y-1">
        <p className="font-semibold text-foreground">{title}</p>
        {message ? <p className="mx-auto max-w-md text-sm text-muted-foreground">{message}</p> : null}
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {retryLabel}
        </Button>
      ) : null}
    </div>
  )
}

export { ErrorState }
