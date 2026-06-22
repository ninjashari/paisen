import { useState } from "react"
import { ImageOff } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Cover-art image with graceful fallback. MAL CDN images are loaded directly
 * via <img> (no next/image remote config needed).
 */
const AnimePoster = ({ src, alt, className }) => {
  const [errored, setErrored] = useState(false)

  if (!src || errored) {
    return (
      <div
        className={cn(
          "bg-muted text-muted-foreground/50 flex items-center justify-center",
          className
        )}
      >
        <ImageOff className="size-6" />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      className={cn("object-cover", className)}
    />
  )
}

export default AnimePoster
