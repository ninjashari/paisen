import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { userStatusList } from "@/utils/constants"
import { cn } from "@/lib/utils"

/**
 * Watch-status selector backed by shadcn Select.
 * value/onValueChange use MAL api values (watching, completed, ...).
 * Pass includeNotAdded for the search view ("not_added" sentinel).
 */
const StatusSelect = ({
  value,
  onValueChange,
  includeNotAdded = false,
  className,
  size = "sm",
}) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger size={size} className={cn("w-full", className)}>
        <SelectValue placeholder="Set status" />
      </SelectTrigger>
      <SelectContent>
        {includeNotAdded && (
          <SelectItem value="not_added">Not Added</SelectItem>
        )}
        {userStatusList.map((s) => (
          <SelectItem key={s.apiValue} value={s.apiValue}>
            {s.pageTitle}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default StatusSelect
