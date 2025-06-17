/**
 * Debug Session Page
 * 
 * This page provides debugging information for user sessions and authentication state.
 * It displays the current session data and additional debug information from the API.
 * Used for troubleshooting authentication and session-related issues.
 */

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from "@/components/layout"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"

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
      const response = await axios.get('/api/debug/session')
      setDebugData(response.data)
    } catch (error) {
      console.error('Debug fetch error:', error)
      setDebugData({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  // Fetch debug data when user becomes authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      fetchDebugData()
    }
  }, [status])

  return (
    <>
      <Layout titleName="Debug Session" />
      <Header />
      <Sidebar currentPage="" />
      <main id="main" className="main">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <h1>Debug Session Information</h1>
              <p className="text-muted">Status: {status}</p>
              
              {session && (
                <div className="card">
                  <div className="card-body">
                    <h5>Session Data:</h5>
                    <pre>{JSON.stringify(session, null, 2)}</pre>
                  </div>
                </div>
              )}
              
              {debugData && (
                <div className="card mt-3">
                  <div className="card-body">
                    <h5>Debug Data:</h5>
                    <pre>{JSON.stringify(debugData, null, 2)}</pre>
                  </div>
                </div>
              )}
              
              {loading && (
                <div className="card mt-3">
                  <div className="card-body">
                    <p>Loading debug data...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

// Export the component as default for Next.js page routing
export default DebugSession

 