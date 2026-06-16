import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Standard page frame for the internal screens (app/dashboard/**). Centralizes
 * the max-width, horizontal/vertical padding and centering so every screen —
 * and each of its loading/error states — shares the same framing.
 *
 * Width and padding follow the Dashboard, which is the reference layout. Content
 * rhythm (e.g. `space-y-*`) is intentionally NOT baked in: pass it via
 * `className` so each screen keeps its own vertical spacing.
 */
function PageContainer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-container"
      className={cn("mx-auto w-full max-w-screen-2xl px-4 sm:px-6 py-8", className)}
      {...props}
    />
  )
}

export { PageContainer }
