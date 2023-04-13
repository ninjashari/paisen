import AuthoriseForm from "@/components/authorise-form"
import Layout from "@/components/layout"
import Loader from "@/components/loader"
import { getSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

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
    <>
      <Layout titleName="Authorise" />
      {loading ? <Loader /> : <AuthoriseForm />}
    </>
  )
}

export default Statistics
