import Mal from "@/lib/mal"
import { getClientId, updateUserData } from "@/utils/userService"
import { getSession } from "next-auth/react"
import Link from "next/link"
import pkceChallenge from "pkce-challenge"
import { useState } from "react"
import { useRouter } from "next/router"
import { AlertTriangle, ExternalLink, ShieldCheck } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import FormShell from "./form-shell"

const AuthoriseForm = () => {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    const session = await getSession()
    if (session) {
      if (e.target.username.validity.valid) {
        const pkce = await pkceChallenge()
        const userUpdateData = {
          username: session.user.username,
          malUsername: username,
          codeChallenge: pkce.code_challenge,
        }

        const response = await updateUserData(userUpdateData)
        if (response) {
          const clientID = await getClientId()
          if (clientID) {
            const mal = new Mal(clientID)

            const url = mal.generateAuthorizeUrl(userUpdateData.codeChallenge)

            window.location.href = url
          } else {
            setShowAlert(true)
            setAlertMessage("Couldn't fetch MAL client ID")
          }
        } else {
          alert("Couldn't update user data")
        }
      } else {
        setShowAlert(true)
        setAlertMessage("Invalid username entered!!")
      }
    } else {
      alert("Couldn't fetch current session, Redirecting to login page!!")
      router.replace("/login")
    }
  }

  return (
    <FormShell>
      <Card className="glow-primary glass border-border/60 rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">
            Link MyAnimeList
          </CardTitle>
          <CardDescription>
            Authorize your MAL account so changes sync both ways
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showAlert && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle />
              <AlertDescription>{alertMessage}</AlertDescription>
            </Alert>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="username">MyAnimeList username</Label>
              <div className="flex items-stretch">
                <span className="border-input bg-muted text-muted-foreground inline-flex items-center rounded-l-xl border border-r-0 px-3 text-sm font-medium">
                  @
                </span>
                <Input
                  id="username"
                  type="text"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yourname"
                  pattern="^[A-Za-z][A-Za-z0-9_-]{1,15}$"
                  required
                  className="rounded-l-none"
                />
              </div>
              <p className="text-muted-foreground text-xs">
                Enter your MyAnimeList username (not the email id).
              </p>
            </div>

            <Button type="submit" variant="brand" className="glow-sm w-full">
              <ShieldCheck className="size-4" />
              Authorize
            </Button>

            <p className="text-muted-foreground text-center text-sm">
              Don&apos;t have a MAL account?{" "}
              <Link
                href="https://myanimelist.net/register.php"
                className="text-primary inline-flex items-center gap-1 font-medium hover:underline"
              >
                Create one
                <ExternalLink className="size-3.5" />
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </FormShell>
  )
}

export default AuthoriseForm
