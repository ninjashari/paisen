/**
 * Jellyfin Information Page
 * 
 * This page displays comprehensive information retrieved from the user's Jellyfin server,
 * including server details, user information, anime library content, and recent activity.
 * Provides real-time insights into Jellyfin integration status and available content.
 */

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import Layout from '@/components/layout'
import Header from '@/components/header'
import Sidebar from '@/components/sidebar'
import Loader from '@/components/loader'

/**
 * JellyfinInfoPage Component
 * 
 * Renders a comprehensive dashboard showing Jellyfin server information,
 * user data, anime library content, and synchronization status.
 * 
 * @returns {JSX.Element} The Jellyfin information page component
 */
export default function JellyfinInfoPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [jellyfinData, setJellyfinData] = useState({
    serverInfo: null,
    userInfo: null,
    animeLibrary: [],
    recentActivity: [],
    syncStatus: null
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  /**
   * Fetches comprehensive Jellyfin information from the API
   * Retrieves server details, user data, anime content, and activity
   */
  const fetchJellyfinInfo = async () => {
    setLoading(true)
    setError(null)

    try {
      // First, check if Jellyfin is configured
      const configResponse = await axios.get('/api/jellyfin/config')
      
      console.log('Config response:', configResponse.data)
      
      if (!configResponse.data.configured) {
        console.log('Jellyfin not configured. Config data:', configResponse.data.data)
        setError('Jellyfin is not configured. Please configure your Jellyfin settings first.')
        setLoading(false)
        return
      }

      // Test server connection with stored configuration
      const serverResponse = await axios.post('/api/jellyfin/test')

      // Fetch anime library and recent activity
      const [libraryResponse, activityResponse] = await Promise.all([
        axios.get('/api/jellyfin/library'),
        axios.get('/api/jellyfin/activity')
      ])

      setJellyfinData({
        serverInfo: serverResponse.data.serverInfo,
        userInfo: serverResponse.data.userInfo,
        animeLibrary: libraryResponse.data.animeItems || [],
        recentActivity: activityResponse.data.recentActivity || [],
        syncStatus: {
          lastSync: serverResponse.data.lastSync,
          totalAnime: libraryResponse.data.totalCount || 0,
          recentEpisodes: activityResponse.data.totalCount || 0
        }
      })

    } catch (err) {
      console.error('Failed to fetch Jellyfin info:', err)
      console.error('Error response:', err.response?.data)
      console.error('Error status:', err.response?.status)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch Jellyfin information'
      
      // Provide helpful error messages for common issues
      if (errorMessage.includes('required')) {
        setError('Jellyfin configuration is incomplete. Please check your Jellyfin settings.')
      } else if (errorMessage.includes('Connection refused') || errorMessage.includes('ECONNREFUSED')) {
        setError('Cannot connect to Jellyfin server. Please check if your server is running and the URL is correct.')
      } else if (errorMessage.includes('Authentication failed')) {
        setError('Jellyfin authentication failed. Please check your API key.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when component mounts and user is authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      fetchJellyfinInfo()
    } else if (status === 'unauthenticated') {
      setLoading(false)
      setError('Authentication required')
    }
  }, [status])

  /**
   * Formats duration from ticks to human-readable format
   * @param {number} ticks - Jellyfin time ticks
   * @returns {string} Formatted duration string
   */
  const formatDuration = (ticks) => {
    if (!ticks) return 'Unknown'
    const minutes = Math.floor(ticks / 600000000)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    }
    return `${minutes}m`
  }

  /**
   * Formats date to readable string
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date string
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Gets status badge class based on playback completion
   * @param {Object} userData - User data from Jellyfin
   * @returns {string} Bootstrap badge class
   */
  const getStatusBadge = (userData) => {
    if (!userData) return 'bg-secondary'
    if (userData.Played) return 'bg-success'
    if (userData.PlaybackPositionTicks > 0) return 'bg-warning'
    return 'bg-secondary'
  }

  /**
   * Gets status text based on playback completion
   * @param {Object} userData - User data from Jellyfin
   * @returns {string} Status text
   */
  const getStatusText = (userData) => {
    if (!userData) return 'Unplayed'
    if (userData.Played) return 'Completed'
    if (userData.PlaybackPositionTicks > 0) return 'In Progress'
    return 'Unplayed'
  }

  /**
   * Calculate pagination for anime library
   * @returns {Object} Pagination data including current items and total pages
   */
  const getPaginatedAnime = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedItems = jellyfinData.animeLibrary.slice(startIndex, endIndex)
    const totalPages = Math.ceil(jellyfinData.animeLibrary.length / itemsPerPage)
    
    return {
      items: paginatedItems,
      totalPages,
      currentPage,
      totalItems: jellyfinData.animeLibrary.length
    }
  }

  /**
   * Handle page change for anime library pagination
   * @param {number} page - New page number
   */
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <>
        <Layout titleName="Jellyfin Information" />
        <Header />
        <Sidebar currentPage="jellyfin-info" />
        <main id="main" className="main">
          <div className="container-fluid">
            <Loader />
          </div>
        </main>
      </>
    )
  }

  if (error) {
    const isConfigurationError = error.includes('not configured') || error.includes('configuration is incomplete')
    
    return (
      <>
        <Layout titleName="Jellyfin Information" />
        <Header />
        <Sidebar currentPage="jellyfin-info" />
        <main id="main" className="main">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="alert alert-danger" role="alert">
                  <h4 className="alert-heading">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {isConfigurationError ? 'Configuration Required' : 'Error'}
                  </h4>
                  <p>{error}</p>
                  <div className="mt-3">
                    {isConfigurationError ? (
                      <a 
                        href="/jellyfin" 
                        className="btn btn-primary me-2"
                      >
                        <i className="bi bi-gear me-2"></i>
                        Configure Jellyfin
                      </a>
                    ) : (
                      <button 
                        className="btn btn-outline-danger me-2" 
                        onClick={fetchJellyfinInfo}
                      >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Retry
                      </button>
                    )}
                    <a 
                      href="/jellyfin" 
                      className="btn btn-outline-secondary"
                    >
                      <i className="bi bi-gear me-2"></i>
                      Jellyfin Settings
                    </a>
                  </div>
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
      <Layout titleName="Jellyfin Information" />
      <Header />
      <Sidebar currentPage="jellyfin-info" />
      <main id="main" className="main">
        <div className="container-fluid">
          {/* Page Header */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <h1>Jellyfin Information</h1>
                <button 
                  className="btn btn-primary" 
                  onClick={fetchJellyfinInfo}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Refresh
                </button>
              </div>
              <p className="text-muted">
                Real-time information from your Jellyfin media server
              </p>
            </div>
          </div>

          {/* Server Information */}
          {jellyfinData.serverInfo && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="bi bi-server me-2"></i>
                      Server Information
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>Server Name:</strong> {jellyfinData.serverInfo.serverName}</p>
                        <p><strong>Version:</strong> {jellyfinData.serverInfo.version}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Server ID:</strong> {jellyfinData.serverInfo.id}</p>
                        <p><strong>Connection:</strong> 
                          <span className="badge bg-success ms-2">Connected</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Information */}
          {jellyfinData.userInfo && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="bi bi-person me-2"></i>
                      User Information
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>Username:</strong> {jellyfinData.userInfo.Name}</p>
                        <p><strong>User ID:</strong> {jellyfinData.userInfo.Id}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Last Activity:</strong> {formatDate(jellyfinData.userInfo.LastActivityDate)}</p>
                        <p><strong>Last Login:</strong> {formatDate(jellyfinData.userInfo.LastLoginDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sync Status */}
          {jellyfinData.syncStatus && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="bi bi-arrow-repeat me-2"></i>
                      Synchronization Status
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4">
                        <div className="text-center">
                          <h3 className="text-primary">{jellyfinData.syncStatus.totalAnime}</h3>
                          <p className="text-muted">Anime Series</p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="text-center">
                          <h3 className="text-success">{jellyfinData.syncStatus.recentEpisodes}</h3>
                          <p className="text-muted">Recent Episodes</p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="text-center">
                          <h6 className="text-info">Last Sync</h6>
                          <p className="text-muted">{formatDate(jellyfinData.syncStatus.lastSync)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Anime Library */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-collection-play me-2"></i>
                    Anime Library ({jellyfinData.animeLibrary.length} series)
                  </h5>
                  {getPaginatedAnime().totalPages > 1 && (
                    <small className="text-muted">
                      Page {getPaginatedAnime().currentPage} of {getPaginatedAnime().totalPages}
                    </small>
                  )}
                </div>
                <div className="card-body">
                  {jellyfinData.animeLibrary.length === 0 ? (
                    <p className="text-muted">No anime content found in your Jellyfin library.</p>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Title</th>
                              <th>Episodes</th>
                              <th>Progress</th>
                              <th>Type</th>
                              <th>Year</th>
                              <th>Genres</th>
                              <th>External IDs</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getPaginatedAnime().items.map((anime, index) => (
                              <tr key={anime.Id || index}>
                                <td>
                                  <div>
                                    <strong>{anime.Name}</strong>
                                    {anime.Studios && anime.Studios.length > 0 && (
                                      <small className="text-muted d-block">
                                        Studio: {anime.Studios[0].Name}
                                      </small>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <div className="text-center">
                                    <span className="badge bg-primary">
                                      {anime.ChildCount || 0}
                                    </span>
                                    <small className="text-muted d-block">Total</small>
                                  </div>
                                </td>
                                <td>
                                  <div className="text-center">
                                    {anime.UserData ? (
                                      <>
                                        <span className="badge bg-success">
                                          {anime.UserData.PlayedPercentage ? Math.round(anime.UserData.PlayedPercentage) : 0}%
                                        </span>
                                        <small className="text-muted d-block">
                                          {anime.UserData.PlayCount || 0} watched
                                        </small>
                                      </>
                                    ) : (
                                      <>
                                        <span className="badge bg-secondary">0%</span>
                                        <small className="text-muted d-block">Unplayed</small>
                                      </>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <span className="badge bg-secondary">{anime.Type}</span>
                                </td>
                                <td>
                                  {anime.ProductionYear || 'Unknown'}
                                </td>
                                <td>
                                  {anime.Genres && anime.Genres.slice(0, 2).map((genre, idx) => (
                                    <span key={idx} className="badge bg-light text-dark me-1 mb-1">
                                      {genre}
                                    </span>
                                  ))}
                                  {anime.Genres && anime.Genres.length > 2 && (
                                    <span className="badge bg-light text-dark">
                                      +{anime.Genres.length - 2} more
                                    </span>
                                  )}
                                </td>
                                <td>
                                  {anime.ProviderIds && Object.entries(anime.ProviderIds).map(([provider, id]) => (
                                    <span key={provider} className="badge bg-warning text-dark me-1 mb-1">
                                      {provider}: {id}
                                    </span>
                                  ))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination Controls */}
                      {getPaginatedAnime().totalPages > 1 && (
                        <nav aria-label="Anime library pagination">
                          <ul className="pagination justify-content-center">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button 
                                className="page-link" 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                              >
                                Previous
                              </button>
                            </li>
                            
                            {[...Array(getPaginatedAnime().totalPages)].map((_, index) => {
                              const page = index + 1;
                              const isCurrentPage = page === currentPage;
                              const showPage = page === 1 || page === getPaginatedAnime().totalPages || 
                                              Math.abs(page - currentPage) <= 2;
                              
                              if (!showPage && page !== currentPage - 3 && page !== currentPage + 3) {
                                return null;
                              }
                              
                              if (page === currentPage - 3 || page === currentPage + 3) {
                                return (
                                  <li key={page} className="page-item disabled">
                                    <span className="page-link">...</span>
                                  </li>
                                );
                              }
                              
                              return (
                                <li key={page} className={`page-item ${isCurrentPage ? 'active' : ''}`}>
                                  <button 
                                    className="page-link" 
                                    onClick={() => handlePageChange(page)}
                                  >
                                    {page}
                                  </button>
                                </li>
                              );
                            })}
                            
                            <li className={`page-item ${currentPage === getPaginatedAnime().totalPages ? 'disabled' : ''}`}>
                              <button 
                                className="page-link" 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === getPaginatedAnime().totalPages}
                              >
                                Next
                              </button>
                            </li>
                          </ul>
                        </nav>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-clock-history me-2"></i>
                    Recent Activity ({jellyfinData.recentActivity.length} episodes)
                  </h5>
                </div>
                <div className="card-body">
                  {jellyfinData.recentActivity.length === 0 ? (
                    <p className="text-muted">No recent anime activity found.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Episode</th>
                            <th>Series</th>
                            <th>Status</th>
                            <th>Duration</th>
                            <th>Last Played</th>
                          </tr>
                        </thead>
                        <tbody>
                          {jellyfinData.recentActivity.slice(0, 15).map((episode, index) => (
                            <tr key={episode.Id || index}>
                              <td>
                                <strong>{episode.Name}</strong>
                                {episode.IndexNumber && (
                                  <small className="text-muted d-block">
                                    Episode {episode.IndexNumber}
                                  </small>
                                )}
                              </td>
                              <td>
                                {episode.SeriesName}
                                {episode.ParentIndexNumber && (
                                  <small className="text-muted d-block">
                                    Season {episode.ParentIndexNumber}
                                  </small>
                                )}
                              </td>
                              <td>
                                <span className={`badge ${getStatusBadge(episode.UserData)}`}>
                                  {getStatusText(episode.UserData)}
                                </span>
                              </td>
                              <td>{formatDuration(episode.RunTimeTicks)}</td>
                              <td>{formatDate(episode.UserData?.LastPlayedDate)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {jellyfinData.recentActivity.length > 15 && (
                        <p className="text-muted text-center">
                          Showing first 15 of {jellyfinData.recentActivity.length} recent episodes
                        </p>
                      )}
                    </div>
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