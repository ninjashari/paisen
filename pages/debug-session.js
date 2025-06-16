import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Layout from "@/components/layout"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"

function DebugSession() {
  const { data: session, status } = useSession()
  const [debugData, setDebugData] = useState(null)
  const [loading, setLoading] = useState(false)

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
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

 