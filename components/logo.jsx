import Link from "next/link"

import { cn } from "@/lib/utils"

/**
 * Paisen wordmark — a bespoke gradient "play/track" mark + gradient text.
 */
const Logo = ({ className, onClick, showText = true }) => {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn("group flex items-center gap-2.5", className)}
    >
      <span className="bg-brand glow-sm relative grid size-9 place-items-center rounded-xl text-white shadow-md transition-transform group-hover:scale-105">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-5"
          aria-hidden="true"
        >
          <path
            d="M5 4.5v15a1 1 0 0 0 1.54.84l11.2-7.5a1 1 0 0 0 0-1.68L6.54 3.66A1 1 0 0 0 5 4.5Z"
            fill="currentColor"
          />
        </svg>
      </span>
      {showText && (
        <span className="font-display text-gradient text-lg font-extrabold tracking-tight">
          Paisen
        </span>
      )}
    </Link>
  )
}

export default Logo
