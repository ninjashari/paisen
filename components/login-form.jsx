import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { AlertTriangle } from "lucide-react"
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
      <Card className="glow-primary">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Login to Your Account</CardTitle>
          <CardDescription>
            Enter your username &amp; password to login
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
              <Input
                id="username"
                type="text"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Login
            </Button>

            <p className="text-muted-foreground text-sm">
              Don&apos;t have account?{" "}
              <Link
                href="/register"
                className="text-primary font-medium hover:underline"
              >
                Create an account
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </FormShell>
  )
}

export default LoginForm
