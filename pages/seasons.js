import AppLayout from "@/components/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarRange } from "lucide-react"

function Seasons() {
  return (
    <AppLayout
      title="Seasons"
      breadcrumb={{ firstPage: "Seasons", title: "Seasons" }}
    >
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
    </AppLayout>
  )
}

export default Seasons
