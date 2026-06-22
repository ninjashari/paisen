import AppShell from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarRange } from "lucide-react"

function Seasons() {
  return (
    <AppShell title="Seasons" subtitle="Browse anime by season.">
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
            <CalendarRange className="size-6" />
          </div>
          <p className="font-display text-lg font-semibold">Coming soon</p>
          <p className="text-muted-foreground max-w-sm text-sm">
            Seasonal anime listings will be available here.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  )
}

export default Seasons
