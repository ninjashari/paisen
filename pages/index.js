import Layout from "@/components/layout"
import Logo from "@/components/logo"
import ThemeToggle from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { signOut, useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { useEffect } from "react"
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  ListVideo,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

const features = [
  {
    icon: ListVideo,
    title: "Track your progress",
    description:
      "Update episodes watched, scores, and status in a couple of clicks.",
    href: "/animelist/current?view=grid",
  },
  {
    icon: Search,
    title: "Search & add instantly",
    description:
      "Find any anime and add it to your list without leaving the dashboard.",
    href: "/search",
  },
  {
    icon: BarChart3,
    title: "Insightful statistics",
    description:
      "See time watched, episode counts, mean score, and score distribution.",
    href: "/statistics",
  },
  {
    icon: RefreshCw,
    title: "Synced with MyAnimeList",
    description:
      "Securely authorize your MAL account — changes sync straight to MAL.",
    href: "/animelist/current",
  },
]

export default function Home() {
  const { data: session } = useSession()
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme("light")
  }, [setTheme])
  const appHref = session?.malAccessToken ? "/animelist/current" : "/authorise"
  const appLabel = session?.malAccessToken ? "Open app" : "Link MAL account"

  return (
    <Layout titleName="Paisen — MyAnimeList Tracker">
      <div className="flex min-h-screen flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between px-4 md:px-8">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {session ? (
              <>
                <Button asChild variant="brand">
                  <Link href={appHref}>{appLabel}</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Sign out"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="size-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild variant="brand">
                  <Link href="/register">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </header>

        {/* Hero */}
        <section className="bg-mesh relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
          {/* Floating accent orbs */}
          <div
            aria-hidden="true"
            className="bg-brand animate-float pointer-events-none absolute left-[8%] top-24 size-40 rounded-full opacity-20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="bg-brand animate-float pointer-events-none absolute bottom-16 right-[10%] size-56 rounded-full opacity-15 blur-3xl"
            style={{ animationDelay: "-3s" }}
          />

          <Badge variant="secondary" className="glass mb-6 gap-1.5">
            <Sparkles className="size-3.5" />
            Your self-hosted MyAnimeList companion
          </Badge>
          <h1 className="font-display max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl">
            Your anime list,{" "}
            <span className="text-gradient">beautifully organized</span>
          </h1>
          <p className="text-muted-foreground mt-6 max-w-xl text-base md:text-lg">
            Paisen is a fast, modern dashboard for tracking, searching, and
            analyzing your MyAnimeList — with everything synced back to MAL.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            {session ? (
              <Button
                asChild
                size="lg"
                variant="brand"
                className="glow-primary"
              >
                <Link href={appHref}>
                  {session.malAccessToken ? "Go to your list" : appLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  className="bg-brand glow-primary text-white"
                >
                  <Link href="/register">
                    Get started
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">I already have an account</Link>
                </Button>
              </>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-24 pt-8 md:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Card className="hover:glow-sm h-full rounded-2xl transition-shadow">
                    <CardContent className="flex flex-col gap-3">
                      <div className="bg-brand glow-sm flex size-11 items-center justify-center rounded-xl text-white">
                        <Icon className="size-5" />
                      </div>
                      <h3 className="font-display font-semibold">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-muted-foreground border-t px-4 py-6 text-center text-sm md:px-8">
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="size-4" />
            Self-hosted • Your data stays yours
          </div>
        </footer>
      </div>
    </Layout>
  )
}
