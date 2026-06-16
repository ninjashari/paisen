import Link from "next/link"
import { ArrowLeft, Compass } from "lucide-react"

import Layout from "@/components/layout"
import Logo from "@/components/logo"
import { Button } from "@/components/ui/button"

export default function ErrorPage() {
  return (
    <Layout titleName="Page Not Found">
      <main className="bg-mesh relative flex min-h-screen flex-col items-center justify-center gap-5 overflow-hidden px-4 text-center">
        <div
          aria-hidden="true"
          className="bg-brand animate-float pointer-events-none absolute -top-24 left-[-10%] size-72 rounded-full opacity-20 blur-3xl"
        />

        <Logo
          showText={false}
          className="animate-float [&_span:first-child]:size-14 [&_svg]:size-7"
        />

        <p className="font-display text-gradient text-8xl font-extrabold leading-none">
          404
        </p>

        <h2 className="font-display text-xl font-semibold">
          This page wandered off the list.
        </h2>
        <p className="text-muted-foreground max-w-md text-sm">
          The page you are looking for doesn&apos;t exist or may have moved.
          Let&apos;s get you back on track.
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="brand" className="glow-sm">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back to home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/animelist/current">
              <Compass className="size-4" />
              Browse your list
            </Link>
          </Button>
        </div>
      </main>
    </Layout>
  )
}
