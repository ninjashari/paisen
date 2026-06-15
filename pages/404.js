import Link from "next/link"

import Layout from "@/components/layout"
import { Button } from "@/components/ui/button"

export default function ErrorPage() {
  return (
    <Layout titleName="Page Not Found">
      <main className="bg-aurora flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-display text-gradient text-7xl font-extrabold">
          404
        </p>
        <h2 className="font-display text-xl font-semibold">
          The page you are looking for doesn&apos;t exist.
        </h2>
        <img
          src="/img/not-found.svg"
          className="my-2 max-w-sm"
          alt="Page Not Found"
        />
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </main>
    </Layout>
  )
}
