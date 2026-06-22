import { Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import AnimePoster from "./anime-poster"
import EpisodeStepper from "./episode-stepper"
import ScoreControl from "./score-control"
import StatusSelect from "./status-select"

const airingDot = {
  green: "bg-success",
  blue: "bg-info",
  red: "bg-destructive",
}

/**
 * Poster-led card for the grid list view.
 * Props: anime (Anime instance), apiStatus, canEdit, handlers.
 */
const AnimeGridCard = ({
  anime,
  apiStatus,
  canEdit,
  onStatus,
  onScore,
  onIncrement,
  onDecrement,
}) => {
  const statusColor = anime.status?.color
  const statusLabel = anime.status?.value || anime.status

  return (
    <Card className="group hover:ring-primary/40 gap-0 overflow-hidden p-0 py-0 transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-1">
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <AnimePoster
          src={anime.imageUrl}
          alt={anime.title}
          className="size-full transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {/* top badges */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2">
          <Badge className="bg-black/55 border-0 text-[10px] text-white backdrop-blur">
            {anime.mediaType}
          </Badge>
          {statusLabel && (
            <span className="flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] text-white backdrop-blur">
              <span className={cn("size-1.5 rounded-full", airingDot[statusColor] || "bg-muted-foreground")} />
              {statusLabel}
            </span>
          )}
        </div>

        {/* title + meta over gradient */}
        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="line-clamp-2 text-sm font-semibold text-white">
            {anime.title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-white/80">
            <span>
              {anime.startSeason} {anime.startSeasonYear}
            </span>
            {anime.meanScore ? (
              <span className="flex items-center gap-0.5">
                <Star className="size-3 text-warning" />
                {anime.meanScore}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* controls */}
      <div className="flex flex-col gap-2.5 p-3">
        <EpisodeStepper
          watched={anime.episodesWatched || 0}
          total={anime.totalEpisodes}
          canEdit={canEdit}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />
        <div className="grid grid-cols-2 gap-2">
          <ScoreControl value={anime.userScore} onValueChange={onScore} />
          <StatusSelect value={apiStatus} onValueChange={onStatus} />
        </div>
      </div>
    </Card>
  )
}

export default AnimeGridCard
