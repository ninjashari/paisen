import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import {
  BarChart3,
  ChevronDown,
  ListVideo,
  Menu,
  Search,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { userListStatus } from "@/utils/constants"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Logo from "./logo"
import ProfileNav from "./profile-nav"
import ThemeToggle from "./theme-toggle"

export const listLinks = Object.entries(userListStatus).map(([key, v]) => ({
  href: `/animelist/${key}`,
  label: v.pageTitle,
}))

const navLink = (active) =>
  cn(
    "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
    active
      ? "text-foreground"
      : "text-muted-foreground hover:text-foreground"
  )

function ActivePill({ show }) {
  if (!show) return null
  return (
    <span className="bg-primary/12 absolute inset-0 -z-10 rounded-full ring-1 ring-primary/30" />
  )
}

const TopNav = () => {
  const router = useRouter()
  const path = router.pathname
  const listActive = path.startsWith("/animelist")
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="glass sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-4 md:px-6">
        <Logo />

        {/* Desktop nav */}
        <nav className="ml-6 hidden items-center gap-1 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(navLink(listActive), "inline-flex items-center gap-1")}>
                <ActivePill show={listActive} />
                <ListVideo className="size-4" />
                My List
                <ChevronDown className="size-3.5 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              {listLinks.map((l) => (
                <DropdownMenuItem key={l.href} asChild>
                  <Link href={l.href} className="cursor-pointer">
                    {l.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/search" className={cn(navLink(path === "/search"), "inline-flex items-center gap-1.5")}>
            <ActivePill show={path === "/search"} />
            <Search className="size-4" />
            Search
          </Link>
          <Link href="/statistics" className={cn(navLink(path === "/statistics"), "inline-flex items-center gap-1.5")}>
            <ActivePill show={path === "/statistics"} />
            <BarChart3 className="size-4" />
            Statistics
          </Link>
        </nav>

        <div className="flex-1" />

        <div className="hidden items-center gap-1.5 md:flex">
          <ThemeToggle />
          <ProfileNav />
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-1.5 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground px-2 pt-1 pb-1 text-xs font-semibold uppercase tracking-wider">
              My List
            </p>
            {listLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm",
                  path === l.href ? "bg-primary/12 text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {l.label}
              </Link>
            ))}
            <div className="bg-border my-2 h-px" />
            <Link href="/search" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm">
              Search
            </Link>
            <Link href="/statistics" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm">
              Statistics
            </Link>
            <div className="bg-border my-2 h-px" />
            <ProfileNav inline />
          </div>
        </div>
      )}
    </header>
  )
}

export default TopNav
