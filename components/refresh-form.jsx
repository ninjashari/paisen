import Mal from "@/lib/mal"
import {
  getClientId,
  getUserRefreshToken,
  updateUserData,
} from "@/utils/userService"
import { getSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useState } from "react"
import { CheckCircle2 } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import FormShell from "./form-shell"

const RefreshForm = () => {
  const router = useRouter()

  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const handleTokenRefresh = async (e) => {
    e.preventDefault()

    const session = await getSession()
    if (session) {
      const currentRefreshToken = await getUserRefreshToken(session)
      if (currentRefreshToken) {
        const clientID = await getClientId()
        if (clientID) {
          const malObj = new Mal(clientID)
          const response = await malObj.refreshAccessToken(currentRefreshToken)
          if (response) {
            // Create user data to be updated
            const userUpdateData = {
              username: session.user.username,
              tokenType: response.token_type,
              refreshToken: response.refresh_token,
              expiryTime: response.expires_in,
              accessToken: response.access_token,
            }

            const res = updateUserData(userUpdateData)
            setShowAlert(true)
            if (res) {
              setAlertMessage(
                "Refresh token generated and user details updated"
              )
            } else {
              setAlertMessage("Couldn't update user data")
            }
          } else {
            setShowAlert(true)
            setAlertMessage(
              "Couldn't refresh access token. Some unknown error occured!!"
            )
          }
        }
      } else {
        alert("Couldn't get refresh token, Redirecting to authorise page!")
        router.replace("/authorise")
      }
    } else {
      alert("Couldn't get session, Redirecting to login page!")
      router.replace("/login")
    }
  }

  return (
    <FormShell>
      <Card className="glow-primary">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Refresh MAL Token</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {showAlert && (
            <Alert>
              <CheckCircle2 />
              <AlertDescription>{alertMessage}</AlertDescription>
            </Alert>
          )}
          <Button
            type="button"
            className="w-full"
            title="Click to refresh"
            onClick={handleTokenRefresh}
          >
            Refresh
          </Button>
        </CardContent>
      </Card>
    </FormShell>
  )
}

export default RefreshForm
