import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import {
  BarChart3,
  ChevronDown,
  Dot,
  LayoutGrid,
  ListVideo,
  Search,
  ShieldCheck,
} from "lucide-react"

import { cn } from "@/lib/utils"
import Logo from "./logo"

const animeChildren = [
  { href: "/animelist/current", label: "Currently Watching" },
  { href: "/animelist/completed", label: "Completed" },
  { href: "/animelist/onhold", label: "On Hold" },
  { href: "/animelist/dropped", label: "Dropped" },
  { href: "/animelist/plantowatch", label: "Plan To Watch" },
]

const topLinks = [
  { href: "/", label: "Home", icon: LayoutGrid },
  { href: "/statistics", label: "Statistics", icon: BarChart3 },
  { href: "/search", label: "Search", icon: Search },
  { href: "/authorise", label: "Authorize", icon: ShieldCheck },
]

const itemBase =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"

const linkClass = (active) =>
  cn(
    itemBase,
    active
      ? "bg-sidebar-primary text-sidebar-primary-foreground glow-primary"
      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
  )

export function SidebarNav({ onNavigate }) {
  const router = useRouter()
  const path = router.pathname
  const animeActive = path.startsWith("/animelist")
  const [open, setOpen] = useState(animeActive)

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      <Link
        href="/"
        onClick={onNavigate}
        className={linkClass(path === "/")}
      >
        <LayoutGrid className="size-4 shrink-0" />
        <span>Home</span>
      </Link>

      <div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            linkClass(animeActive),
            "w-full cursor-pointer"
          )}
        >
          <ListVideo className="size-4 shrink-0" />
          <span>Anime List</span>
          <ChevronDown
            className={cn(
              "ml-auto size-4 transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
        {open && (
          <div className="mt-1 flex flex-col gap-0.5 pl-3">
            {animeChildren.map((child) => {
              const active = path === child.href
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg py-1.5 pr-3 pl-2 text-sm transition-colors",
                    active
                      ? "text-sidebar-primary-foreground bg-sidebar-primary/90 font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Dot className="size-4 shrink-0" />
                  <span>{child.label}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {topLinks.slice(1).map((link) => {
        const Icon = link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={linkClass(path === link.href)}
          >
            <Icon className="size-4 shrink-0" />
            <span>{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

const Sidebar = () => {
  return (
    <aside className="bg-sidebar hidden border-r lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
      <div className="flex h-16 items-center border-b px-5">
        <Logo />
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarNav />
      </div>
    </aside>
  )
}

export default Sidebar
