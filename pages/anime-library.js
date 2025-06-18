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
import DbAnimeTable from '@/components/db-anime-table'
import { v4 as uuidv4 } from 'uuid';

export default function AnimeLibraryPage() {
  const { data: session, status } = useSession()
  const [animeList, setAnimeList] = useState([])
  const [mappings, setMappings] = useState({})
  const [filteredAnime, setFilteredAnime] = useState([])
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
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
  const fetchAnimeList = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const response = await axios.get('/api/anime/list', { params: { limit: 0, includeExternalIds: true } })
      const animeData = response.data.data || []
      
      setAnimeList(animeData)
      setFilteredAnime(animeData)

      if (animeData.length > 0) {
        fetchMappings(animeData);
      }
      
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
      if (isRefresh) {
        setIsRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  const fetchMappings = async (animeData) => {
    const malIds = animeData.map(a => a.malId).filter(Boolean);
    if (malIds.length === 0) return;

    try {
      const response = await axios.get(`/api/anime/mapping?malIds=${malIds.join(',')}`);
      if (response.data.success) {
        const mappingMap = {};
        response.data.mappings.forEach(mapping => {
          mappingMap[mapping.malId] = mapping;
        });
        setMappings(mappingMap);
      }
    } catch (error) {
      console.error('Failed to fetch mappings:', error);
      // Non-critical error
    }
  };

  const handleSyncToDb = async () => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    setIsSyncing(true);
    setError(null); // Clear previous errors
    try {
      // This now returns immediately with a 202
      await axios.post('/api/mal/sync-to-db', { options: { sessionId: newSessionId } });
    } catch (error) {
      console.error('Error starting sync:', error);
      setError(error.response?.data?.message || 'Failed to start the sync process.');
      setIsSyncing(false); // Stop the sync UI if it fails to start
    }
  };

  const onSyncComplete = (report) => {
    console.log('Sync completed!', report);
    setIsSyncing(false);
    // Optionally, you can show a success message here
    // And refresh the list to show updated data
    fetchAnimeList(); 
  };

  const onSyncError = (error) => {
    console.error('Sync failed:', error);
    setIsSyncing(false);
    setError(error.message || 'The synchronization process encountered an error.');
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

    setFilteredAnime(filtered)
  }

  // Apply filters whenever search term or status filter changes
  useEffect(() => {
    applyFilters()
  }, [searchTerm, statusFilter, animeList])

  // Fetch data when component mounts and user is authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      fetchAnimeList()
    } else if (status === 'unauthenticated') {
      setLoading(false)
      setError('Authentication required')
    }
  }, [status])


  if (loading && !animeList.length) {
    return (
      <>
        <Layout titleName="Anime Library" />
        <Header />
        <Sidebar currentPage="anime-library" />
        <main id="main" className="main">
          <div className="pagetitle">
            <h1>Anime Library</h1>
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
                    onClick={() => fetchAnimeList(true)}
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Retrying...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Retry
                      </>
                    )}
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
          <SyncProgressBar 
            sessionId={sessionId} 
            show={isSyncing}
            onComplete={onSyncComplete}
            onError={onSyncError}
          />
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
                  onClick={() => fetchAnimeList(true)}
                  disabled={loading || isRefreshing}
                >
                  {isRefreshing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Refresh
                    </>
                  )}
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
                    <div className="col-md-6">
                      <label className="form-label">Search</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by title, genre, or studio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="col-md-3">
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
                    <div className="col-md-3 d-flex align-items-end">
                      <button
                        className="btn btn-outline-secondary w-100"
                        onClick={() => {
                          setSearchTerm('')
                          setStatusFilter('all')
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
              <DbAnimeTable 
                animeList={filteredAnime} 
                loading={loading || isRefreshing}
                mappings={mappings}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  )
} 