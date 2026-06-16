import { Card } from "@/components/ui/card"

/** Poster-grid loading skeleton matching AnimeListView's grid. */
const AnimeListSkeleton = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="gap-0 overflow-hidden p-0 py-0">
          <div className="shimmer aspect-[2/3] w-full" />
          <div className="flex flex-col gap-2.5 p-3">
            <div className="shimmer h-7 w-full rounded-full" />
            <div className="grid grid-cols-2 gap-2">
              <div className="shimmer h-8 rounded-md" />
              <div className="shimmer h-8 rounded-md" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default AnimeListSkeleton
