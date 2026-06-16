import Logo from "@/components/logo"
import { exchangeMalToken } from "@/utils/malClient"
import { getQueryParams } from "@/utils/malService"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function OAuthCallback() {
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return
    handleCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  const handleCallback = async () => {
    try {
      const queryParams = getQueryParams(router.asPath.toString())
      const code = queryParams.code

      if (!code) {
        toast.error("Missing authorization code from MyAnimeList.")
        router.replace("/")
        return
      }

      await exchangeMalToken(code)
      toast.success("MyAnimeList account authorized.")
      // Hard redirect so the session cookie is re-fetched and picks up the new malAccessToken.
      window.location.href = "/animelist/current"
    } catch (err) {
      console.error("OAuth token exchange failed:", err)
      toast.error(err.message || "Authorization failed. Please try again.")
      router.replace("/")
    }
  }

  return (
    <main className="bg-mesh relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden px-4 text-center">
      <div
        aria-hidden="true"
        className="bg-brand animate-float pointer-events-none absolute -top-20 right-[-10%] size-72 rounded-full opacity-20 blur-3xl"
      />
      <Logo
        showText={false}
        className="animate-float [&_span:first-child]:size-16 [&_svg]:size-8"
      />
      <Loader2 className="text-primary size-7 animate-spin" />
      <div>
        <p className="font-display text-lg font-semibold">
          Finishing authorization
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          Connecting your MyAnimeList account…
        </p>
      </div>
    </main>
  )
}
