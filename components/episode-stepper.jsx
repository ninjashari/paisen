import { Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Episode progress control: minus / progress bar / plus + count.
 * Props: watched, total, canEdit, onIncrement, onDecrement, compact.
 */
const EpisodeStepper = ({
  watched = 0,
  total = 0,
  canEdit = true,
  onIncrement,
  onDecrement,
  className,
}) => {
  const pct = total > 0 ? Math.min(100, Math.round((watched / total) * 100)) : 0

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size="icon"
        className="size-7 shrink-0 rounded-full"
        disabled={!canEdit || watched <= 0}
        onClick={onDecrement}
        aria-label="Decrease watched episodes"
      >
        <Minus className="size-3.5" />
      </Button>

      <div className="min-w-16 flex-1">
        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
          <div
            className="bg-brand h-full rounded-full transition-[width]"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="size-7 shrink-0 rounded-full"
        disabled={!canEdit || (total > 0 && watched >= total)}
        onClick={onIncrement}
        aria-label="Increase watched episodes"
      >
        <Plus className="size-3.5" />
      </Button>

      <span className="text-muted-foreground w-12 shrink-0 text-right text-xs tabular-nums">
        {watched}/{total || "?"}
      </span>
    </div>
  )
}

export default EpisodeStepper
