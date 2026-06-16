import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import { AlertTriangle, Lock, ShieldCheck, User, UserPlus } from "lucide-react"
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

const RegisterForm = ({ userForm }) => {
  const router = useRouter()
  const contentType = "application/json"
  // User data form
  const [form, setForm] = useState({
    name: userForm.name,
    username: userForm.username,
    password: userForm.password,
  })

  const [confirmPassword, setConfirmPassword] = useState("")

  const [confirmPasswordErrorMsg, setConfirmPasswordErrorMsg] = useState(
    "Please enter confirm password"
  )

  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  // When confirm password value is changed
  const handleConfirmPasswordChange = (e) => {
    const target = e.target
    const value = target.value

    if (value && value === form.password) {
      target.setCustomValidity("")
    } else if (value && value !== form.password) {
      target.setCustomValidity("Invalid confirm password")
      setConfirmPasswordErrorMsg("Confirm password should match password")
    } else {
      target.setCustomValidity("Invalid confirm password")
      setConfirmPasswordErrorMsg("Please enter confirm password")
    }

    setConfirmPassword(value)
  }

  // Handle form value changed
  const handleChange = (e) => {
    const target = e.target
    const value = target.value
    const name = target.name

    setForm({
      ...form,
      [name]: value,
    })

    setShowAlert(false)
  }

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault()
    if (
      e.target.name.validity.valid &&
      e.target.username.validity.valid &&
      e.target.password.validity.valid &&
      e.target.confirmPassword.validity.valid
    ) {
      postData(form)
    }
  }

  // Call register API to save user data
  const postData = async (form) => {
    try {
      // Hash the password in the browser so the raw value never appears in the
      // request payload. The server still bcrypts the received value.
      const addUser = {
        name: form.name,
        username: form.username,
        password: await hashClientPassword(form.password),
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          Accept: contentType,
          "Content-Type": contentType,
        },
        body: JSON.stringify(addUser),
      })

      if (res.ok) {
        router.push("/")
      } else {
        const response = await res.json()
        if (response.userExists) {
          setAlertMessage(response.message)
        } else {
          if (response.message) {
            setAlertMessage(response.message)
          } else {
            setAlertMessage("Failed to add user")
          }
        }
        setShowAlert(true)
      }
    } catch (error) {
      console.error(error)
      setAlertMessage("Failed to add user")
      setShowAlert(true)
    }
  }

  return (
    <FormShell>
      <Card className="glow-primary glass border-border/60 rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">
            Create your account
          </CardTitle>
          <CardDescription>
            Start tracking your anime in minutes
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
              <Label htmlFor="name">Your name</Label>
              <div className="relative">
                <User className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ada Lovelace"
                  className="pl-9"
                  pattern="^[A-Za-z][A-Za-z ]{0,48}[A-Za-z]$"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <UserPlus className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  id="username"
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="yourname"
                  className="pl-9"
                  required
                  pattern="^[A-Za-z][A-Za-z0-9_-]{7,31}$"
                />
              </div>
              <p className="text-muted-foreground text-xs">
                8–32 characters, starts with a letter, alphanumeric.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-9"
                  required
                  pattern="^[A-Za-z0-9!@#$%^&*_=+-]{8,32}$"
                />
              </div>
              <p className="text-muted-foreground text-xs">
                Between 8 and 32 characters.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <ShieldCheck className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="••••••••"
                  className="pl-9"
                  required
                />
              </div>
              {confirmPassword && confirmPassword !== form.password && (
                <p className="text-destructive text-xs">
                  {confirmPasswordErrorMsg}
                </p>
              )}
            </div>

            <Button type="submit" variant="brand" className="glow-sm w-full">
              <UserPlus className="size-4" />
              Create account
            </Button>

            <p className="text-muted-foreground text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </FormShell>
  )
}

export default RegisterForm
