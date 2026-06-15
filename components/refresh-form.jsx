import { refreshMalToken } from "@/utils/malClient"
import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import FormShell from "./form-shell"

const RefreshForm = () => {
  const [loading, setLoading] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const handleTokenRefresh = async () => {
    setLoading(true)
    setShowAlert(false)
    try {
      await refreshMalToken()
      setAlertMessage("Refresh token generated and user details updated.")
      setShowAlert(true)
      toast.success("Token refreshed")
    } catch (err) {
      console.error("Token refresh failed:", err)
      toast.error(err.message || "Couldn't refresh token")
    } finally {
      setLoading(false)
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
            disabled={loading}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Refresh
          </Button>
        </CardContent>
      </Card>
    </FormShell>
  )
}

export default RefreshForm
