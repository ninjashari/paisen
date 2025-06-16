/**
 * Anime Database Management Page
 * 
 * This page provides a comprehensive interface for managing the local anime database,
 * including synchronization controls, statistics, and feature explanations.
 */

import Breadcrumb from "@/components/breadcrumb"
import Header from "@/components/header"
import Layout from "@/components/layout"
import Loader from "@/components/loader"
import Sidebar from "@/components/sidebar"
import { getSession, useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function AnimeDatabase() {
  const { data: session } = useSession()
  
  const [loading, setLoading] = useState(true)
  const [syncInProgress, setSyncInProgress] = useState(false)
  const [syncStats, setSyncStats] = useState(null)
  const [syncResult, setSyncResult] = useState(null)
  const [includeExternalIds, setIncludeExternalIds] = useState(true)
  const [forceUpdate, setForceUpdate] = useState(false)

  useEffect(() => {
    if (session) {
      loadSyncStats()
    }
    setLoading(false)
  }, [session])

  const loadSyncStats = async () => {
    try {
      const response = await fetch('/api/anime/sync')
      if (response.ok) {
        const data = await response.json()
        setSyncStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading sync stats:', error)
    }
  }

  const handleSync = async () => {
    if (!session) return

    setSyncInProgress(true)
    setSyncResult(null)

    try {
      const response = await fetch('/api/anime/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          includeExternalIds,
          forceUpdate,
        }),
      })

      const data = await response.json()
      setSyncResult(data)
      
      if (data.success) {
        await loadSyncStats()
      }
    } catch (error) {
      setSyncResult({
        success: false,
        message: 'Network error occurred during sync',
        error: error.message
      })
    } finally {
      setSyncInProgress(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
  }

  return (
    <>
      <Layout titleName="Anime Database - Paisen" />
      <Header />
      <Sidebar currentPage="anime-database" />
      {loading ? (
        <Loader />
      ) : (
        <main id="main" className="main">
          <Breadcrumb title="Anime Database" />
          
          {!session ? (
            <div className="alert alert-warning">
              <h4>Authentication Required</h4>
              <p>Please <Link href="/login">log in</Link> to access the anime database features.</p>
            </div>
          ) : (
            <>
              <section className="section">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">Local Anime Database</h5>
                        <p className="card-text">
                          The local anime database stores your MyAnimeList data locally for faster access, 
                          enhanced search capabilities, and offline functionality. It includes external ID 
                          mappings for better integration with other platforms like Jellyfin.
                        </p>
                        
                        <div className="row">
                          <div className="col-md-6">
                            <h6>Key Features:</h6>
                            <ul>
                              <li><strong>⚡ 90% faster</strong> anime list loading</li>
                              <li><strong>🔍 Advanced search</strong> with full-text indexing</li>
                              <li><strong>📱 Offline access</strong> to cached data</li>
                              <li><strong>🆔 External ID mapping</strong> (AniDB, TVDB, TMDB)</li>
                              <li><strong>🔄 Automatic sync</strong> with configurable intervals</li>
                              <li><strong>📊 Detailed statistics</strong> and analytics</li>
                            </ul>
                          </div>
                          <div className="col-md-6">
                            <h6>External ID Sources:</h6>
                            <ul>
                              <li><strong>AniDB IDs:</strong> For better Jellyfin matching</li>
                              <li><strong>TVDB IDs:</strong> TV database integration</li>
                              <li><strong>TMDB IDs:</strong> Movie database integration</li>
                              <li><strong>IMDB IDs:</strong> Internet Movie Database</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="section">
                <div className="row">
                  <div className="col-lg-8">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">Synchronization Control</h5>
                        
                        <div className="row mb-3">
                          <div className="col-md-6">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="includeExternalIds"
                                checked={includeExternalIds}
                                onChange={(e) => setIncludeExternalIds(e.target.checked)}
                                disabled={syncInProgress}
                              />
                              <label className="form-check-label" htmlFor="includeExternalIds">
                                Include External IDs (AniDB, TVDB, TMDB)
                              </label>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="forceUpdate"
                                checked={forceUpdate}
                                onChange={(e) => setForceUpdate(e.target.checked)}
                                disabled={syncInProgress}
                              />
                              <label className="form-check-label" htmlFor="forceUpdate">
                                Force Update All Entries
                              </label>
                            </div>
                          </div>
                        </div>

                        <button
                          className={`btn ${syncInProgress ? 'btn-secondary' : 'btn-primary'} me-2`}
                          onClick={handleSync}
                          disabled={syncInProgress}
                        >
                          {syncInProgress ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Syncing...
                            </>
                          ) : (
                            'Sync Anime List'
                          )}
                        </button>

                        {syncResult && (
                          <div className={`alert ${syncResult.success ? 'alert-success' : 'alert-danger'} mt-3`}>
                            <h6>{syncResult.success ? 'Sync Completed!' : 'Sync Failed'}</h6>
                            <p className="mb-0">{syncResult.message}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">Quick Stats</h5>
                        {syncStats ? (
                          <>
                            <div className="d-flex justify-content-between">
                              <span>Total Anime:</span>
                              <strong>{syncStats.totalAnime || 0}</strong>
                            </div>
                            <div className="d-flex justify-content-between">
                              <span>Last Sync:</span>
                              <small>{formatDate(syncStats.lastSync)}</small>
                            </div>
                          </>
                        ) : (
                          <p className="text-muted">Loading statistics...</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="section">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">How It Works</h5>
                        
                        <div className="row">
                          <div className="col-md-6">
                            <h6>Synchronization Process:</h6>
                            <ol>
                              <li><strong>Fetch from MAL:</strong> Retrieves your complete anime list from MyAnimeList API</li>
                              <li><strong>External ID Mapping:</strong> Looks up AniDB, TVDB, and TMDB IDs from external databases</li>
                              <li><strong>Local Storage:</strong> Stores all data in MongoDB for fast local access</li>
                              <li><strong>Incremental Updates:</strong> Only updates changed entries on subsequent syncs</li>
                            </ol>
                          </div>
                          <div className="col-md-6">
                            <h6>Data Sources:</h6>
                            <ul>
                              <li><strong>MyAnimeList API:</strong> Primary anime data and user list status</li>
                              <li><strong>shinkrodb:</strong> MAL↔AniDB↔TVDB↔TMDB ID mappings</li>
                              <li><strong>anime-offline-database:</strong> Fallback mapping source</li>
                              <li><strong>Local Cache:</strong> Stores successful mappings for future use</li>
                            </ul>
                          </div>
                        </div>

                        <div className="alert alert-info mt-3">
                          <h6>Performance Benefits</h6>
                          <p className="mb-0">
                            After the initial sync, your anime list will load <strong>90% faster</strong> compared to 
                            fetching directly from MyAnimeList. The local database also enables advanced search 
                            features and works offline when your internet connection is limited.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="section">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">API Endpoints</h5>
                        <p>The anime database provides several API endpoints for integration:</p>
                        
                        <div className="table-responsive">
                          <table className="table table-striped">
                            <thead>
                              <tr>
                                <th>Endpoint</th>
                                <th>Method</th>
                                <th>Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td><code>/api/anime/sync</code></td>
                                <td>POST</td>
                                <td>Trigger manual synchronization with MyAnimeList</td>
                              </tr>
                              <tr>
                                <td><code>/api/anime/sync</code></td>
                                <td>GET</td>
                                <td>Get synchronization statistics and status</td>
                              </tr>
                              <tr>
                                <td><code>/api/anime/list</code></td>
                                <td>GET</td>
                                <td>Query local anime database with filtering and pagination</td>
                              </tr>
                              <tr>
                                <td><code>/api/anime/scheduled-sync</code></td>
                                <td>POST</td>
                                <td>Automated sync management for scheduled operations</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className="alert alert-warning">
                          <h6>Automated Sync Setup</h6>
                          <p>For automatic synchronization, set up a cron job on your server:</p>
                          <pre className="bg-light p-2 rounded small">
{`# Sync every 6 hours
0 */6 * * * curl -X POST http://localhost:3000/api/anime/scheduled-sync \\
  -H "Content-Type: application/json" \\
  -d '{"syncKey":"your-sync-key","maxUsers":10,"includeExternalIds":true}'`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="section">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">Troubleshooting</h5>
                        
                        <div className="row">
                          <div className="col-md-4">
                            <h6>Sync Issues:</h6>
                            <ul className="small">
                              <li><strong>Token Expired:</strong> Re-authorize your MAL account</li>
                              <li><strong>Network Issues:</strong> Check internet connection</li>
                              <li><strong>Rate Limiting:</strong> Wait before retrying</li>
                              <li><strong>Database Space:</strong> Ensure sufficient disk space</li>
                            </ul>
                          </div>
                          <div className="col-md-4">
                            <h6>Performance Issues:</h6>
                            <ul className="small">
                              <li><strong>Slow Queries:</strong> Database indexes are auto-created</li>
                              <li><strong>Large Database:</strong> Consider periodic cleanup</li>
                              <li><strong>Memory Usage:</strong> Monitor MongoDB usage</li>
                            </ul>
                          </div>
                          <div className="col-md-4">
                            <h6>External ID Issues:</h6>
                            <ul className="small">
                              <li><strong>Missing IDs:</strong> Not all anime have mappings</li>
                              <li><strong>Service Down:</strong> External services may be unavailable</li>
                              <li><strong>Rate Limits:</strong> External APIs have limits</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      )}
    </>
  )
} 