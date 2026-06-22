/**
 * Debug Session Page
 *
 * This page provides debugging information for user sessions and authentication state.
 * It displays the current session data and additional debug information from the API.
 * Used for troubleshooting authentication and session-related issues.
 */

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import axios from "axios"
import AppShell from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * DebugSession Component
 *
 * Renders a debug interface showing current session state and additional debug data.
 * Automatically fetches debug information when user is authenticated.
 *
 * @returns {JSX.Element} The debug session page component
 */
function DebugSession() {
  const { data: session, status } = useSession()
  const [debugData, setDebugData] = useState(null)
  const [loading, setLoading] = useState(false)

  /**
   * Fetches debug data from the API endpoint
   * Sets loading state and handles errors appropriately
   */
  const fetchDebugData = async () => {
    setLoading(true)
    try {
      const response = await axios.get("/api/debug/session")
      setDebugData(response.data)
    } catch (error) {
      console.error("Debug fetch error:", error)
      setDebugData({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  // Fetch debug data when user becomes authenticated
  useEffect(() => {
    if (status === "authenticated") {
      fetchDebugData()
    }
  }, [status])

  const preClass =
    "bg-muted text-muted-foreground overflow-x-auto rounded-md p-4 text-xs"

  return (
    <AppShell title="Debug Session">
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">Status: {status}</p>

        {session && (
          <Card>
            <CardHeader>
              <CardTitle>Session Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className={preClass}>{JSON.stringify(session, null, 2)}</pre>
            </CardContent>
          </Card>
        )}

        {debugData && (
          <Card>
            <CardHeader>
              <CardTitle>Debug Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className={preClass}>
                {JSON.stringify(debugData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card>
            <CardContent className="text-muted-foreground py-6 text-sm">
              Loading debug data...
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  )
}

// Export the component as default for Next.js page routing
export default DebugSession
