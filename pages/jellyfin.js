/**
 * Jellyfin Integration Page
 * 
 * This page provides comprehensive Jellyfin server integration functionality,
 * including configuration, synchronization, and troubleshooting tools.
 * Enables automatic anime list updates from Jellyfin media server activity.
 */

import { useSession, getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Sidebar from "@/components/sidebar"
import JellyfinConfig from "@/components/jellyfin-config"
import JellyfinSync from "@/components/jellyfin-sync"
import JellyfinTroubleshoot from "@/components/jellyfin-troubleshoot"
import Loader from "@/components/loader"

function Jellyfin() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isPageLoading, setIsPageLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return // Still loading
    
    if (!session) {
      router.push('/login')
      return
    }
    
    // Page is ready when session is authenticated
    if (status === 'authenticated') {
      setIsPageLoading(false)
    }
  }, [session, status, router])

  // Show loading while checking authentication or page is loading
  if (status === 'loading' || isPageLoading) {
    return (
      <>
        <Layout titleName="Jellyfin Integration" />
        <Header />
        <Sidebar currentPage="jellyfin" />
        <main id="main" className="main">
          <div className="container-fluid">
            <Loader />
          </div>
        </main>
      </>
    )
  }

  // Don't render if not authenticated
  if (!session) {
    return null
  }

  return (
    <>
      <Layout titleName="Jellyfin Integration" />
      <Header />
      <Sidebar currentPage="jellyfin" />
      <main id="main" className="main">
        <Breadcrumb firstPage="Jellyfin" title="Jellyfin Integration" />
        
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="mb-4">
                <h1>Jellyfin Integration</h1>
                <p className="text-muted">
                  Connect your Jellyfin server to automatically update your MyAnimeList 
                  when you watch anime episodes.
                </p>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-8">
              <JellyfinConfig />
            </div>
            <div className="col-lg-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    Setup Instructions
                  </h5>
                </div>
                <div className="card-body">
                  <ol className="list-unstyled">
                    <li className="mb-2">
                      <strong>1. Generate API Key</strong>
                      <p className="small text-muted mb-0">
                        In Jellyfin Dashboard → API Keys, create a new API key
                      </p>
                    </li>
                    <li className="mb-2">
                      <strong>2. Configure Server</strong>
                      <p className="small text-muted mb-0">
                        Enter your server URL and API key, then test the connection
                      </p>
                    </li>
                    <li className="mb-2">
                      <strong>3. Set Up Webhook</strong>
                      <p className="small text-muted mb-0">
                        Add webhook URL to Jellyfin: <br/>
                        <code className="small">{typeof window !== 'undefined' ? window.location.origin : ''}/api/jellyfin/webhook</code>
                      </p>
                    </li>
                    <li className="mb-2">
                      <strong>4. Enable Sync</strong>
                      <p className="small text-muted mb-0">
                        Turn on automatic sync and start watching anime!
                      </p>
                    </li>
                  </ol>
                  
                  <hr className="my-3" />
                  
                  <h6 className="text-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Common Issues
                  </h6>
                  <ul className="list-unstyled small">
                    <li className="mb-1">
                      <strong>Connection Refused:</strong> Jellyfin server not running or wrong URL
                    </li>
                    <li className="mb-1">
                      <strong>Server URL Examples:</strong>
                      <br />• Local: <code>http://localhost:8096</code>
                      <br />• Network: <code>http://192.168.1.100:8096</code>
                      <br />• Domain: <code>https://jellyfin.example.com</code>
                    </li>
                    <li className="mb-1">
                      <strong>API Key:</strong> Must be generated by admin user
                    </li>
                    <li className="mb-1">
                      <strong>Firewall:</strong> Ensure port is accessible from Paisen
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-lg-8">
              <JellyfinSync />
            </div>
            <div className="col-lg-4">
              <JellyfinTroubleshoot />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default Jellyfin
