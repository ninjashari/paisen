import { Star } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { scoreList } from "@/utils/constants"
import { cn } from "@/lib/utils"

/**
 * Score selector (0–10) backed by shadcn Select.
 * value is a number; onValueChange returns a number.
 */
const ScoreControl = ({ value, onValueChange, className, size = "sm" }) => {
  return (
    <Select
      value={value != null ? String(value) : "0"}
      onValueChange={(v) => onValueChange(Number(v))}
    >
      <SelectTrigger size={size} className={cn("w-full min-w-20", className)}>
        <Star className="size-3.5 text-warning" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {scoreList.map((s) => (
          <SelectItem key={s.score} value={String(s.score)}>
            {s.value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default ScoreControl
