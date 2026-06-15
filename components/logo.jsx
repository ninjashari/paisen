import Link from "next/link"

import { cn } from "@/lib/utils"

const Logo = ({ className, onClick }) => {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn("flex items-center gap-2.5", className)}
    >
      <img
        src="/img/logo.png"
        alt="Paisen"
        className="size-8 rounded-md object-contain"
      />
      <span className="font-display text-lg font-bold tracking-tight text-gradient">
        Paisen
      </span>
    </Link>
  )
}

export default Logo
