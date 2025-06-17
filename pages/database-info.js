/**
 * Database Information Page
 * 
 * This page displays comprehensive information from the local MongoDB database,
 * including anime collection data, user statistics, sync history, and data integrity metrics.
 * Provides insights into the local data store and synchronization status.
 */

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import Layout from '@/components/layout'
import Header from '@/components/header'
import Sidebar from '@/components/sidebar'
import Loader from '@/components/loader'
import BarChart from '@/components/bar-chart'

/**
 * DatabaseInfoPage Component
 * 
 * Renders a comprehensive dashboard showing local database information,
 * including anime collection statistics, user data, and sync metadata.
 * 
 * @returns {JSX.Element} The database information page component
 */
export default function DatabaseInfoPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dbData, setDbData] = useState({
    animeCollection: {
      totalAnime: 0,
      byStatus: {},
      byMediaType: {},
      byGenre: {},
      recentlyAdded: []
    },
    userInfo: {
      username: '',
      animeCount: 0,
      lastSync: null,
      jellyfinConfigured: false
    },
    syncMetadata: {
      lastSync: null,
      syncHistory: [],
      errorCount: 0
    },
    dataIntegrity: {
      missingExternalIds: 0,
      duplicateEntries: 0,
      orphanedRecords: 0
    }
  })

  /**
   * Fetches comprehensive database information from the API
   * Retrieves anime collection data, user statistics, and sync metadata
   */
  const fetchDatabaseInfo = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch database statistics
      const [animeResponse, userResponse, syncResponse, integrityResponse] = await Promise.all([
        axios.get('/api/database/anime-stats'),
        axios.get('/api/database/current-user'),
        axios.get('/api/database/sync-stats'),
        axios.get('/api/database/integrity-check')
      ])

      setDbData({
        animeCollection: animeResponse.data,
        userInfo: userResponse.data,
        syncMetadata: syncResponse.data,
        dataIntegrity: integrityResponse.data
      })

    } catch (err) {
      console.error('Failed to fetch database info:', err)
      setError(err.response?.data?.message || err.message || 'Failed to fetch database information')
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when component mounts and user is authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      fetchDatabaseInfo()
    } else if (status === 'unauthenticated') {
      setLoading(false)
      setError('Authentication required')
    }
  }, [status])

  /**
   * Formats large numbers with appropriate suffixes
   * @param {number} num - Number to format
   * @returns {string} Formatted number string
   */
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  /**
   * Formats date to readable string
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date string
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Gets status color based on data integrity
   * @param {number} count - Error/issue count
   * @returns {string} Bootstrap color class
   */
  const getStatusColor = (count) => {
    if (count === 0) return 'success'
    if (count < 10) return 'warning'
    return 'danger'
  }

  /**
   * Prepares chart data for status distribution
   * @param {Object} statusData - Status count data
   * @returns {Object} Chart data object
   */
  const prepareStatusChartData = (statusData) => {
    const labels = Object.keys(statusData)
    const data = Object.values(statusData)
    
    return {
      labels: labels.map(label => label.replace('_', ' ').toUpperCase()),
      datasets: [{
        label: 'Anime Count',
        data: data,
        backgroundColor: [
          '#198754', // watching - green
          '#0d6efd', // completed - blue
          '#ffc107', // on_hold - yellow
          '#dc3545', // dropped - red
          '#6c757d'  // plan_to_watch - gray
        ]
      }]
    }
  }

  /**
   * Prepares chart data for media type distribution
   * @param {Object} mediaData - Media type count data
   * @returns {Object} Chart data object
   */
  const prepareMediaChartData = (mediaData) => {
    const labels = Object.keys(mediaData)
    const data = Object.values(mediaData)
    
    return {
      labels: labels.map(label => label.toUpperCase()),
      datasets: [{
        label: 'Series Count',
        data: data,
        backgroundColor: [
          '#0d6efd', // tv - blue
          '#198754', // movie - green
          '#ffc107', // ova - yellow
          '#fd7e14', // special - orange
          '#6f42c1', // ona - purple
          '#20c997'  // music - teal
        ]
      }]
    }
  }

  if (loading) {
    return (
      <>
        <Layout titleName="Database Information" />
        <Header />
        <Sidebar currentPage="database-info" />
        <main id="main" className="main">
          <div className="container-fluid">
            <Loader />
          </div>
        </main>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Layout titleName="Database Information" />
        <Header />
        <Sidebar currentPage="database-info" />
        <main id="main" className="main">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="alert alert-danger" role="alert">
                  <h4 className="alert-heading">Error</h4>
                  <p>{error}</p>
                  <button 
                    className="btn btn-outline-danger" 
                    onClick={fetchDatabaseInfo}
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Layout titleName="Database Information" />
      <Header />
      <Sidebar currentPage="database-info" />
      <main id="main" className="main">
        <div className="container-fluid">
          {/* Page Header */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <h1>Database Information</h1>
                <button 
                  className="btn btn-primary" 
                  onClick={fetchDatabaseInfo}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Refresh
                </button>
              </div>
              <p className="text-muted">
                Local database statistics and data integrity information
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-primary">{formatNumber(dbData.animeCollection.totalAnime)}</h3>
                  <p className="text-muted">Total Anime</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-success">{formatNumber(dbData.userInfo.animeCount)}</h3>
                  <p className="text-muted">Your Anime</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className={`text-${dbData.userInfo.jellyfinConfigured ? 'success' : 'warning'}`}>
                    {dbData.userInfo.jellyfinConfigured ? 'Yes' : 'No'}
                  </h3>
                  <p className="text-muted">Jellyfin Configured</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className={`text-${getStatusColor(dbData.dataIntegrity.errorCount)}`}>
                    {dbData.dataIntegrity.errorCount}
                  </h3>
                  <p className="text-muted">Data Issues</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-person me-2"></i>
                    Your Account Information
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Username:</strong> {dbData.userInfo.username || 'Not available'}</p>
                      <p><strong>Your Anime Count:</strong> {dbData.userInfo.animeCount}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Last Sync:</strong> {formatDate(dbData.userInfo.lastSync)}</p>
                      <p><strong>Jellyfin Status:</strong> 
                        <span className={`badge ms-2 ${dbData.userInfo.jellyfinConfigured ? 'bg-success' : 'bg-warning'}`}>
                          {dbData.userInfo.jellyfinConfigured ? 'Configured' : 'Not Configured'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Anime Collection Statistics */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-bar-chart me-2"></i>
                    Anime by Status
                  </h5>
                </div>
                <div className="card-body">
                  {Object.keys(dbData.animeCollection.byStatus).length > 0 ? (
                    <BarChart 
                      data={prepareStatusChartData(dbData.animeCollection.byStatus)}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { display: false }
                        }
                      }}
                    />
                  ) : (
                    <p className="text-muted">No status data available</p>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-pie-chart me-2"></i>
                    Anime by Media Type
                  </h5>
                </div>
                <div className="card-body">
                  {Object.keys(dbData.animeCollection.byMediaType).length > 0 ? (
                    <BarChart 
                      data={prepareMediaChartData(dbData.animeCollection.byMediaType)}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { display: false }
                        }
                      }}
                    />
                  ) : (
                    <p className="text-muted">No media type data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Data Integrity Status */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-shield-check me-2"></i>
                    Data Integrity Status
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <div className="text-center">
                        <h4 className={`text-${getStatusColor(dbData.dataIntegrity.missingExternalIds)}`}>
                          {dbData.dataIntegrity.missingExternalIds}
                        </h4>
                        <p className="text-muted">Missing External IDs</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center">
                        <h4 className={`text-${getStatusColor(dbData.dataIntegrity.duplicateEntries)}`}>
                          {dbData.dataIntegrity.duplicateEntries}
                        </h4>
                        <p className="text-muted">Duplicate Entries</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="text-center">
                        <h4 className={`text-${getStatusColor(dbData.dataIntegrity.orphanedRecords)}`}>
                          {dbData.dataIntegrity.orphanedRecords}
                        </h4>
                        <p className="text-muted">Orphaned Records</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sync History */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-clock-history me-2"></i>
                    Recent Sync History
                  </h5>
                </div>
                <div className="card-body">
                  {dbData.syncMetadata.syncHistory && dbData.syncMetadata.syncHistory.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>User</th>
                            <th>Type</th>
                            <th>Items Processed</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dbData.syncMetadata.syncHistory.slice(0, 10).map((sync, index) => (
                            <tr key={index}>
                              <td>{formatDate(sync.date)}</td>
                              <td>{sync.username}</td>
                              <td>
                                <span className="badge bg-secondary">{sync.type}</span>
                              </td>
                              <td>{sync.itemsProcessed || 0}</td>
                              <td>
                                <span className={`badge bg-${sync.success ? 'success' : 'danger'}`}>
                                  {sync.success ? 'Success' : 'Failed'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted">No sync history available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recently Added Anime */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-plus-circle me-2"></i>
                    Recently Added Anime
                  </h5>
                </div>
                <div className="card-body">
                  {dbData.animeCollection.recentlyAdded && dbData.animeCollection.recentlyAdded.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>MAL ID</th>
                            <th>Media Type</th>
                            <th>Status</th>
                            <th>Added Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dbData.animeCollection.recentlyAdded.slice(0, 15).map((anime, index) => (
                            <tr key={anime.malId || index}>
                              <td>
                                <strong>{anime.title}</strong>
                                {anime.alternative_titles?.en && (
                                  <small className="text-muted d-block">
                                    {anime.alternative_titles.en[0]}
                                  </small>
                                )}
                              </td>
                              <td>
                                <a 
                                  href={`https://myanimelist.net/anime/${anime.malId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-decoration-none"
                                >
                                  {anime.malId}
                                </a>
                              </td>
                              <td>
                                <span className="badge bg-info">{anime.media_type}</span>
                              </td>
                              <td>
                                <span className="badge bg-secondary">{anime.status}</span>
                              </td>
                              <td>{formatDate(anime.syncMetadata?.lastSyncedFromMal)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted">No recently added anime found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
} 