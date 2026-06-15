import Loader from "@/components/loader"
import { exchangeMalToken } from "@/utils/malClient"
import { getQueryParams } from "@/utils/malService"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { toast } from "sonner"

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
    <main className="bg-aurora flex min-h-screen items-center justify-center">
      <Loader />
    </main>
  )
}
