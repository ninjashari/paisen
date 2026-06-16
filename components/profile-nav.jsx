import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { LogOut, RefreshCw, ShieldCheck, User } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const getInitials = (name) =>
  (name || "U")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase()

const ProfileNav = ({ inline = false }) => {
  const { data: session } = useSession()

  if (!session) {
    return (
      <Button asChild size="sm" variant="brand">
        <Link href="/login">Sign in</Link>
      </Button>
    )
  }

  const name = session.user?.name || "User"

  // Mobile inline list (rendered inside the mobile menu)
  if (inline) {
    return (
      <>
        <Link href="/authorise" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
          <ShieldCheck className="size-4" /> Authorize MAL
        </Link>
        <Link href="/refresh" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
          <RefreshCw className="size-4" /> Refresh token
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-destructive flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-1.5">
          <Avatar className="ring-primary/30 size-8 ring-2">
            <AvatarFallback className="bg-brand text-xs font-bold text-white">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <User className="size-4 opacity-70" />
          <span className="truncate">{name}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/authorise" className="cursor-pointer">
            <ShieldCheck /> Authorize MAL
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/refresh" className="cursor-pointer">
            <RefreshCw /> Refresh token
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileNav
