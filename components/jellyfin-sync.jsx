/**
 * Jellyfin Manual Sync Component
 * 
 * This component provides a user interface for manually synchronizing
 * Jellyfin anime watch history with MyAnimeList. It includes options
 * for different sync modes and displays detailed results.
 * 
 * Features:
 * - Manual sync trigger with options
 * - Dry run mode for testing
 * - Real-time sync progress
 * - Detailed sync results display
 * - Error handling and reporting
 */

import { useState } from 'react'
import axios from 'axios'

function JellyfinSync() {
  // Sync state
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const [message, setMessage] = useState(null)
  
  // Sync options
  const [options, setOptions] = useState({
    dryRun: false,
    maxItems: 50,
    forceUpdate: false
  })

  /**
   * Handle sync option changes
   * 
   * @param {Event} e - Input change event
   */
  const handleOptionChange = (e) => {
    const { name, value, type, checked } = e.target
    setOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
    }))
  }

  /**
   * Start manual synchronization
   */
  const startSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    setMessage(null)

    try {
      const response = await axios.post('/api/jellyfin/sync', { options })

      if (response.data.success) {
        setSyncResult(response.data.data)
        setMessage({
          type: 'success',
          text: options.dryRun ? 'Dry run completed successfully' : 'Sync completed successfully'
        })
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Sync failed'
      setMessage({
        type: 'error',
        text: errorMessage
      })
      
      // If there's partial result data, still show it
      if (error.response?.data?.data) {
        setSyncResult(error.response.data.data)
      }
    } finally {
      setSyncing(false)
    }
  }

  /**
   * Clear sync results
   */
  const clearResults = () => {
    setSyncResult(null)
    setMessage(null)
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">
          <i className="bi bi-arrow-repeat me-2"></i>
          Manual Sync
        </h5>
      </div>
      
      <div className="card-body">
        {/* Status Messages */}
        {message && (
          <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`} role="alert">
            {message.text}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setMessage(null)}
              aria-label="Close"
            ></button>
          </div>
        )}

        {/* Sync Options */}
        <div className="row mb-3">
          <div className="col-md-6">
            <div className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="dryRun"
                name="dryRun"
                checked={options.dryRun}
                onChange={handleOptionChange}
                disabled={syncing}
              />
              <label className="form-check-label" htmlFor="dryRun">
                Dry Run Mode
              </label>
            </div>
            <div className="form-text">
              Test sync without actually updating MyAnimeList
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="forceUpdate"
                name="forceUpdate"
                checked={options.forceUpdate}
                onChange={handleOptionChange}
                disabled={syncing}
              />
              <label className="form-check-label" htmlFor="forceUpdate">
                Force Update
              </label>
            </div>
            <div className="form-text">
              Update even if already synced
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="maxItems" className="form-label">
              Max Items to Process
            </label>
            <input
              type="number"
              className="form-control"
              id="maxItems"
              name="maxItems"
              value={options.maxItems}
              onChange={handleOptionChange}
              min="1"
              max="200"
              disabled={syncing}
            />
            <div className="form-text">
              Limit the number of episodes to process (1-200)
            </div>
          </div>
        </div>

        {/* Sync Button */}
        <div className="mb-3">
          <button
            type="button"
            className="btn btn-primary me-2"
            onClick={startSync}
            disabled={syncing}
          >
            {syncing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                {options.dryRun ? 'Running Dry Run...' : 'Syncing...'}
              </>
            ) : (
              <>
                <i className="bi bi-play-fill me-2"></i>
                {options.dryRun ? 'Run Dry Run' : 'Start Sync'}
              </>
            )}
          </button>

          {syncResult && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={clearResults}
              disabled={syncing}
            >
              <i className="bi bi-x-circle me-2"></i>
              Clear Results
            </button>
          )}
        </div>

        {/* Sync Results */}
        {syncResult && (
          <div className="mt-4">
            <h6>
              <i className="bi bi-clipboard-data me-2"></i>
              Sync Results
            </h6>

            {/* Summary Cards */}
            <div className="row mb-3">
              <div className="col-md-3">
                <div className="card bg-primary text-white">
                  <div className="card-body text-center">
                    <h5 className="card-title">{syncResult.processed}</h5>
                    <p className="card-text">Processed</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-success text-white">
                  <div className="card-body text-center">
                    <h5 className="card-title">{syncResult.updated}</h5>
                    <p className="card-text">Updated</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-warning text-white">
                  <div className="card-body text-center">
                    <h5 className="card-title">{syncResult.skipped}</h5>
                    <p className="card-text">Skipped</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-danger text-white">
                  <div className="card-body text-center">
                    <h5 className="card-title">{syncResult.errors}</h5>
                    <p className="card-text">Errors</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Successful Matches */}
            {syncResult.matches && syncResult.matches.length > 0 && (
              <div className="mb-3">
                <h6 className="text-success">
                  <i className="bi bi-check-circle me-2"></i>
                  Successfully Matched ({syncResult.matches.length})
                </h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Series</th>
                        <th>MAL ID</th>
                        <th>Episodes</th>
                        <th>Status</th>
                        <th>Confidence</th>
                        {options.dryRun && <th>Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {syncResult.matches.map((match, index) => (
                        <tr key={index}>
                          <td>{match.series}</td>
                          <td>
                            <a 
                              href={`https://myanimelist.net/anime/${match.malId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-decoration-none"
                            >
                              {match.malId}
                            </a>
                          </td>
                          <td>
                            {match.previousEpisodes} → {match.newEpisodes}
                          </td>
                          <td>
                            <span className={`badge bg-${getStatusColor(match.status)}`}>
                              {match.status}
                            </span>
                          </td>
                          <td>
                            <div className="progress" style={{ width: '60px', height: '20px' }}>
                              <div 
                                className="progress-bar" 
                                role="progressbar" 
                                style={{ width: `${(match.confidence || 0) * 100}%` }}
                                aria-valuenow={(match.confidence || 0) * 100}
                                aria-valuemin="0" 
                                aria-valuemax="100"
                              >
                                {Math.round((match.confidence || 0) * 100)}%
                              </div>
                            </div>
                          </td>
                          {options.dryRun && (
                            <td>
                              <span className="badge bg-info">Would Update</span>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* No Matches */}
            {syncResult.noMatches && syncResult.noMatches.length > 0 && (
              <div className="mb-3">
                <h6 className="text-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  No MAL Matches Found ({syncResult.noMatches.length})
                </h6>
                <div className="list-group">
                  {syncResult.noMatches.map((item, index) => (
                    <div key={index} className="list-group-item">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{item.series}</h6>
                        <small className="text-muted">{item.reason}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Errors */}
            {syncResult.errors && syncResult.errors.length > 0 && (
              <div className="mb-3">
                <h6 className="text-danger">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  Errors ({syncResult.errors.length})
                </h6>
                <div className="list-group">
                  {syncResult.errors.map((error, index) => (
                    <div key={index} className="list-group-item list-group-item-danger">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">{error.series}</h6>
                      </div>
                      <p className="mb-1">{error.error}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Text */}
        <div className="mt-4">
          <h6>
            <i className="bi bi-info-circle me-2"></i>
            How Manual Sync Works
          </h6>
          <ul className="list-unstyled">
            <li>• Fetches your recent anime watch history from Jellyfin</li>
            <li>• Matches anime series with MyAnimeList entries</li>
            <li>• Updates your MAL list with watched episode counts</li>
            <li>• Automatically sets status to "watching" or "completed"</li>
            <li>• Use dry run mode to preview changes before applying</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

/**
 * Get Bootstrap color class for anime status
 * 
 * @param {string} status - Anime status
 * @returns {string} Bootstrap color class
 */
function getStatusColor(status) {
  switch (status) {
    case 'watching':
      return 'primary'
    case 'completed':
      return 'success'
    case 'on_hold':
      return 'warning'
    case 'dropped':
      return 'danger'
    case 'plan_to_watch':
      return 'secondary'
    default:
      return 'light'
  }
}

export default JellyfinSync 