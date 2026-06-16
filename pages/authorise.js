import AuthoriseForm from "@/components/authorise-form"
import Layout from "@/components/layout"
import Logo from "@/components/logo"
import { getSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

function Statistics() {
  const router = useRouter()
  const [loading, isLoading] = useState(true)

  useEffect(() => {
    isLoading(true)
    checkCurrentSession()
  }, [])

  const checkCurrentSession = async () => {
    const session = await getSession()
    if (session) {
      isLoading(false)
    } else {
      router.replace("/")
    }
  }
  return (
    <Layout titleName="Authorise">
      {loading ? (
        <main className="bg-mesh flex min-h-screen flex-col items-center justify-center gap-6">
          <Logo showText={false} className="[&_span:first-child]:size-14 [&_svg]:size-7" />
          <Loader2 className="text-primary size-7 animate-spin" />
          <p className="text-muted-foreground text-sm">Checking your session…</p>
        </main>
      ) : (
        <AuthoriseForm />
      )}
    </Layout>
  )
}

export default Statistics
