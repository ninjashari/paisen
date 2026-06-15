import Layout from "@/components/layout"
import Logo from "@/components/logo"
import ThemeToggle from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { signOut, useSession } from "next-auth/react"
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
  },
  {
    icon: Search,
    title: "Search & add instantly",
    description:
      "Find any anime and add it to your list without leaving the dashboard.",
  },
  {
    icon: BarChart3,
    title: "Insightful statistics",
    description:
      "See time watched, episode counts, mean score, and score distribution.",
  },
  {
    icon: RefreshCw,
    title: "Synced with MyAnimeList",
    description:
      "Securely authorize your MAL account — changes sync straight to MAL.",
  },
]

export default function Home() {
  const { data: session } = useSession()

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
                <Button asChild>
                  <Link href={session.malAccessToken ? "/animelist/current" : "/authorise"}>
                    {session.malAccessToken ? "Open app" : "Link MAL account"}
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" aria-label="Sign out" onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="size-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </header>

        {/* Hero */}
        <section className="bg-aurora flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
          <Badge variant="secondary" className="mb-5 gap-1.5">
            <Sparkles className="size-3.5" />
            Your self-hosted MyAnimeList companion
          </Badge>
          <h1 className="font-display max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl">
            Your anime list,{" "}
            <span className="text-gradient">beautifully organized</span>
          </h1>
          <p className="text-muted-foreground mt-5 max-w-xl text-base md:text-lg">
            Paisen is a fast, modern dashboard for tracking, searching, and
            analyzing your MyAnimeList — with everything synced back to MAL.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {session ? (
              <Button asChild size="lg" className="glow-primary">
                <Link href={session.malAccessToken ? "/animelist/current" : "/authorise"}>
                  {session.malAccessToken ? "Go to your list" : "Link MAL account"}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="glow-primary">
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
        <section className="mx-auto w-full max-w-6xl px-4 pb-20 md:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="h-full">
                  <CardContent className="flex flex-col gap-3">
                    <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
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
