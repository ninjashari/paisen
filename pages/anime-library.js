/**
 * Anime Library Page
 * 
 * This page displays the complete local database anime collection with detailed information,
 * search functionality, filtering options, and comprehensive statistics.
 * Provides a complete view of all anime data stored in the application database.
 */

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import Layout from '@/components/layout'
import Header from '@/components/header'
import Sidebar from '@/components/sidebar'
import Loader from '@/components/loader'
import SyncProgressBar from '@/components/sync-progress-bar'
import { v4 as uuidv4 } from 'uuid';

export default function AnimeLibraryPage() {
  const { data: session, status } = useSession()
  const [animeList, setAnimeList] = useState([])
  const [filteredAnime, setFilteredAnime] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncReport, setSyncReport] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('title')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    watching: 0,
    planToWatch: 0,
    dropped: 0,
    onHold: 0
  })

  /**
   * Fetches anime list from the local database
   * Retrieves comprehensive anime data with user statistics
   */
  const fetchAnimeList = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get('/api/anime/list')
      const animeData = response.data.data || []
      
      setAnimeList(animeData)
      setFilteredAnime(animeData)
      
      // Calculate statistics
      const statistics = {
        total: animeData.length,
        completed: animeData.filter(anime => anime.userStatus?.status === 'completed').length,
        watching: animeData.filter(anime => anime.userStatus?.status === 'watching').length,
        planToWatch: animeData.filter(anime => anime.userStatus?.status === 'plan_to_watch').length,
        dropped: animeData.filter(anime => anime.userStatus?.status === 'dropped').length,
        onHold: animeData.filter(anime => anime.userStatus?.status === 'on_hold').length,
      }
      setStats(statistics)

    } catch (err) {
      console.error('Failed to fetch anime list:', err)
      setError(err.response?.data?.message || 'Failed to fetch anime library')
    } finally {
      setLoading(false)
    }
  }

  const handleSyncToDb = async () => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    setIsSyncing(true);
    setSyncReport(null);
    try {
      const response = await axios.post('/api/mal/sync-to-db', { options: { sessionId: newSessionId } });
      if (response.data.success) {
        setSyncReport(response.data.data);
        fetchAnimeList(); // Refresh the list after a successful sync
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Sync error:', error);
      setError('An error occurred during sync. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (key) => {
    if (sortBy !== key) return null;
    return sortOrder === 'asc' ? '▲' : '▼';
  };

  /**
   * Applies search and filter criteria to the anime list
   * Updates the filtered anime list based on current filters
   */
  const applyFilters = () => {
    let filtered = [...animeList]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(anime =>
        anime.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (anime.alternative_titles && anime.alternative_titles.en && anime.alternative_titles.en.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (anime.genres && anime.genres.some(genre => genre.name.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        (anime.studios && anime.studios.some(studio => studio.name.toLowerCase().includes(searchTerm.toLowerCase())))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(anime => anime.userStatus?.status === statusFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'score':
          aValue = a.score || 0
          bValue = b.score || 0
          break
        case 'episodes':
          aValue = a.episodes || 0
          bValue = b.episodes || 0
          break
        case 'year':
          aValue = a.year || 0
          bValue = b.year || 0
          break
        case 'updated':
          aValue = new Date(a.updatedAt || a.createdAt)
          bValue = new Date(b.updatedAt || b.createdAt)
          break
        default:
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
      }

      if (sortOrder === 'desc') {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    })

    setFilteredAnime(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Apply filters whenever search term, status filter, or sorting changes
  useEffect(() => {
    applyFilters()
  }, [searchTerm, statusFilter, sortBy, sortOrder, animeList])

  // Fetch data when component mounts and user is authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      fetchAnimeList()
    } else if (status === 'unauthenticated') {
      setLoading(false)
      setError('Authentication required')
    }
  }, [status])

  /**
   * Calculate pagination for anime list
   * @returns {Object} Pagination data including current items and total pages
   */
  const getPaginatedAnime = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedItems = filteredAnime.slice(startIndex, endIndex)
    const totalPages = Math.ceil(filteredAnime.length / itemsPerPage)
    
    return {
      items: paginatedItems,
      totalPages,
      currentPage,
      totalItems: filteredAnime.length
    }
  }

  /**
   * Handle page change for pagination
   * @param {number} page - New page number
   */
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  /**
   * Get status badge class based on anime status
   * @param {string} status - Anime status
   * @returns {string} Bootstrap badge class
   */
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'bg-success'
      case 'watching': return 'bg-primary'
      case 'plan_to_watch': return 'bg-info'
      case 'dropped': return 'bg-danger'
      case 'on_hold': return 'bg-warning'
      default: return 'bg-secondary'
    }
  }

  /**
   * Get formatted status text
   * @param {string} status - Anime status
   * @returns {string} Formatted status text
   */
  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed'
      case 'watching': return 'Watching'
      case 'plan_to_watch': return 'Plan to Watch'
      case 'dropped': return 'Dropped'
      case 'on_hold': return 'On Hold'
      default: return 'Unknown'
    }
  }

  /**
   * Format date to readable string
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date string
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <>
        <Layout titleName="Anime Library" />
        <Header />
        <Sidebar currentPage="anime-library" />
        <main id="main" className="main">
          <div className="pagetitle">
            <h1>Anime Library</h1>
            <div className="d-flex justify-content-end my-3">
              <button
                className="btn btn-primary"
                onClick={handleSyncToDb}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Syncing...
                  </>
                ) : (
                  'Sync with MyAnimeList'
                )}
              </button>
            </div>
          </div>
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
        <Layout titleName="Anime Library" />
        <Header />
        <Sidebar currentPage="anime-library" />
        <main id="main" className="main">
          <div className="pagetitle">
            <h1>Anime Library</h1>
            <div className="d-flex justify-content-end my-3">
              <button
                className="btn btn-primary"
                onClick={handleSyncToDb}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Syncing...
                  </>
                ) : (
                  'Sync with MyAnimeList'
                )}
              </button>
            </div>
          </div>
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="alert alert-danger" role="alert">
                  <h4 className="alert-heading">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Error Loading Library
                  </h4>
                  <p>{error}</p>
                  <button 
                    className="btn btn-outline-danger" 
                    onClick={fetchAnimeList}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
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

  const paginatedData = getPaginatedAnime()

  return (
    <>
      <Layout titleName="Anime Library" />
      <Header />
      <Sidebar currentPage="anime-library" />
      <main id="main" className="main">
        <div className="pagetitle">
          <h1>Anime Library</h1>
          <div className="d-flex justify-content-end my-3">
            <button
              className="btn btn-primary"
              onClick={handleSyncToDb}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Syncing...
                </>
              ) : (
                'Sync with MyAnimeList'
              )}
            </button>
          </div>
        </div>
        {isSyncing && (
          <SyncProgressBar sessionId={sessionId} show={isSyncing} />
        )}
        {syncReport && !isSyncing && (
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Sync Report</h4>
            </div>
            <div className="card-body">
              <p>
                <strong>Processed:</strong> {syncReport.processed} | 
                <strong>Updated:</strong> {syncReport.updated} | 
                <strong>Created:</strong> {syncReport.created} | 
                <strong>Errors:</strong> {syncReport.errors}
              </p>
              {syncReport.errors > 0 && (
                <>
                  <hr />
                  <h5>Error Details:</h5>
                  <ul className="list-group">
                    {syncReport.noMatches.map((item, index) => (
                      <li key={index} className="list-group-item"><strong>{item.title}:</strong> {item.error}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}
        <div className="container-fluid">
          {/* Page Header */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center">
                <h1>
                  <i className="bi bi-collection me-2"></i>
                  Anime Library
                </h1>
                <button 
                  className="btn btn-outline-primary" 
                  onClick={fetchAnimeList}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Refresh
                </button>
              </div>
              <p className="text-muted">
                Complete collection of anime from your local database
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="row mb-4">
            <div className="col-md-2">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-primary">{stats.total}</h3>
                  <p className="text-muted mb-0">Total</p>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-success">{stats.completed}</h3>
                  <p className="text-muted mb-0">Completed</p>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-primary">{stats.watching}</h3>
                  <p className="text-muted mb-0">Watching</p>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-info">{stats.planToWatch}</h3>
                  <p className="text-muted mb-0">Plan to Watch</p>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-warning">{stats.onHold}</h3>
                  <p className="text-muted mb-0">On Hold</p>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-danger">{stats.dropped}</h3>
                  <p className="text-muted mb-0">Dropped</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Search</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by title, genre, or studio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="watching">Watching</option>
                        <option value="plan_to_watch">Plan to Watch</option>
                        <option value="on_hold">On Hold</option>
                        <option value="dropped">Dropped</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Sort By</label>
                      <select
                        className="form-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="title">Title</option>
                        <option value="score">Score</option>
                        <option value="episodes">Episodes</option>
                        <option value="year">Year</option>
                        <option value="updated">Last Updated</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Order</label>
                      <select
                        className="form-select"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                      >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                      </select>
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                      <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() => {
                          setSearchTerm('')
                          setStatusFilter('all')
                          setSortBy('title')
                          setSortOrder('asc')
                        }}
                      >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Anime List */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="bi bi-list me-2"></i>
                    Anime Collection ({paginatedData.totalItems} entries)
                  </h5>
                  {paginatedData.totalPages > 1 && (
                    <small className="text-muted">
                      Page {paginatedData.currentPage} of {paginatedData.totalPages}
                    </small>
                  )}
                </div>
                <div className="card-body">
                  {paginatedData.totalItems === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-collection display-1 text-muted"></i>
                      <h4 className="mt-3">No Anime Found</h4>
                      <p className="text-muted">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'Try adjusting your search or filter criteria'
                          : 'Your anime library is empty. Start adding anime to see them here!'
                        }
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th scope="col" onClick={() => handleSort('title')}>Title {getSortIcon('title')}</th>
                              <th scope="col">Genres</th>
                              <th scope="col">Studios</th>
                              <th scope="col">Status</th>
                              <th scope="col" onClick={() => handleSort('score')}>Score {getSortIcon('score')}</th>
                              <th scope="col" onClick={() => handleSort('episodes')}>Episodes {getSortIcon('episodes')}</th>
                              <th scope="col" onClick={() => handleSort('year')}>Year {getSortIcon('year')}</th>
                              <th scope="col" onClick={() => handleSort('updated')}>Last Updated {getSortIcon('updated')}</th>
                              <th scope="col">MAL ID</th>
                              <th scope="col">AniDB ID</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedData.items.map((anime, index) => (
                              <tr key={anime._id || anime.malId || index}>
                                <td>
                                  <div>
                                    <strong>{anime.title}</strong>
                                    {anime.englishTitle && anime.englishTitle !== anime.title && (
                                      <small className="text-muted d-block">
                                        {anime.englishTitle}
                                      </small>
                                    )}
                                  </div>
                                </td>
                                <td className="small">
                                  {anime.genres?.map(genre => genre.name).join(', ')}
                                </td>
                                <td className="small">
                                  {anime.studios?.map(studio => studio.name).join(', ')}
                                </td>
                                <td>
                                  <span className={`badge ${getStatusBadge(anime.status)}`}>
                                    {getStatusText(anime.status)}
                                  </span>
                                </td>
                                <td>
                                  <div className="text-center">
                                    {anime.score ? (
                                      <span className="badge bg-warning text-dark">
                                        {anime.score}/10
                                      </span>
                                    ) : (
                                      <span className="text-muted">Not Rated</span>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <div className="text-center">
                                    <span className="badge bg-primary">
                                      {anime.episodes || 'Unknown'}
                                    </span>
                                    {anime.watchedEpisodes !== undefined && (
                                      <small className="text-muted d-block">
                                        {anime.watchedEpisodes} watched
                                      </small>
                                    )}
                                  </div>
                                </td>
                                <td>{anime.year || 'Unknown'}</td>
                                <td>
                                  <small className="text-muted">
                                    {formatDate(anime.updatedAt || anime.createdAt)}
                                  </small>
                                </td>
                                <td>{anime.malId || 'N/A'}</td>
                                <td>{anime.anidbId || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Controls */}
                      {paginatedData.totalPages > 1 && (
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
                            
                            {[...Array(paginatedData.totalPages)].map((_, index) => {
                              const page = index + 1;
                              const isCurrentPage = page === currentPage;
                              const showPage = page === 1 || page === paginatedData.totalPages || 
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
                            
                            <li className={`page-item ${currentPage === paginatedData.totalPages ? 'disabled' : ''}`}>
                              <button 
                                className="page-link" 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === paginatedData.totalPages}
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
        </div>
      </main>
    </>
  )
} 