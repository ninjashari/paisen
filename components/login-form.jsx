import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { AlertTriangle, Lock, LogIn, User } from "lucide-react"
import { hashClientPassword } from "@/utils/clientCrypto"

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

const LoginForm = () => {
  const router = useRouter()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    const hashedPassword = await hashClientPassword(password)

    await signIn("credentials", {
      redirect: false,
      username,
      password: hashedPassword,
    })
      .then((res) => {
        if (!res.ok) {
          // Surface backend/service errors distinctly from bad credentials.
          const message =
            res?.error && res.error !== "CredentialsSignin"
              ? res.error
              : "Username/Password invalid. Please try again"
          setAlertMessage(message)
          setShowAlert(true)
        } else {
          router.replace("/")
        }
      })
      .catch((err) => {
        console.error(err)
        setAlertMessage("Username/Password invalid. Please try again")
        setShowAlert(true)
      })
  }

  return (
    <FormShell>
      <Card className="glow-primary glass border-border/60 rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">
            Welcome back
          </CardTitle>
          <CardDescription>
            Sign in to pick up where you left off
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
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  id="username"
                  type="text"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yourname"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="brand" className="glow-sm w-full">
              <LogIn className="size-4" />
              Sign in
            </Button>

            <p className="text-muted-foreground text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary font-medium hover:underline"
              >
                Create one
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </FormShell>
  )
}

export default LoginForm
